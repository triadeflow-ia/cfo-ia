/**
 * LLMProvider - Implementação com function calling via LLM API
 * Suporta OpenAI, Anthropic, etc (plugável via ENV)
 */

import { AIProvider, Decision, MessageContext } from '../domain/types'
import { tools, getToolsAsArray } from '@/modules/whatsapp-tools'
import { extendedTools } from '@/modules/whatsapp-tools/tools-extended'
import { logger } from '@/shared/logger'

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai'
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini'
const LLM_API_KEY = process.env.LLM_API_KEY
const LLM_API_URL = process.env.LLM_API_URL
const LLM_TIMEOUT_MS = parseInt(process.env.LLM_TIMEOUT_MS || '5000', 10)

interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

/**
 * Converte tools para formato function calling
 */
function getToolsForLLM(): ToolDefinition[] {
  const allTools = [...getToolsAsArray()]
  
  // Adicionar extended tools
  const toolDefs: ToolDefinition[] = allTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: 'object',
      properties: (tool.schema as any)._def?.shape || {},
      required: [],
    },
  }))

  // Adicionar extended tools manualmente (sem schema Zod, definir aqui)
  toolDefs.push(
    {
      name: 'dreSummary',
      description: 'Resumo DRE (Demonstrativo de Resultado) do período',
      parameters: {
        type: 'object',
        properties: {
          month: { type: 'string', description: 'Mês no formato YYYY-MM' },
        },
        required: ['month'],
      },
    },
    {
      name: 'cashflowSummary',
      description: 'Resumo de fluxo de caixa projetado',
      parameters: {
        type: 'object',
        properties: {
          projectionDays: { type: 'number', description: 'Número de dias para projeção (padrão: 30)' },
        },
        required: [],
      },
    },
    {
      name: 'growthOverview',
      description: 'Visão geral de crescimento (MRR, ARR, clientes, churn)',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    }
  )

  return toolDefs
}

/**
 * Chama API do LLM com function calling
 */
async function callLLM(
  message: string,
  context: MessageContext,
  tools: ToolDefinition[]
): Promise<Decision> {
  if (!LLM_API_KEY) {
    throw new Error('LLM_API_KEY not configured')
  }

  // Construir contexto de mensagens recentes (máx 10)
  const recentMessages = context.recentMessages.slice(-10).map(m => ({
    role: m.direction === 'IN' ? 'user' : 'assistant',
    content: m.text,
  }))

  const systemPrompt = `Você é um assistente financeiro via WhatsApp. Sua função é:
1. Analisar a mensagem do usuário
2. Escolher UMA ferramenta (tool) apropriada da lista disponível
3. Preencher os parâmetros da ferramenta conforme o schema
4. NUNCA inventar IDs ou valores que não foram mencionados
5. Se não souber qual tool usar ou faltar informação crítica, retornar "help" ou "unknown"

REGRAS CRÍTICAS:
- Retorne APENAS uma function_call por vez
- NUNCA escreva texto livre como resposta principal
- Se a ação for de escrita (create/update/delete), a confirmação será pedida depois
- Use valores exatos mencionados pelo usuário, não invente nada`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentMessages,
    { role: 'user', content: message },
  ]

  const requestBody: any = {
    model: LLM_MODEL,
    messages,
    tools: tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    })),
    tool_choice: 'auto', // LLM escolhe se precisa de tool ou não
    temperature: 0.3, // Baixa temperatura para reduzir criatividade
    max_tokens: 500,
  }

  const url = LLM_API_URL ||
    (LLM_PROVIDER === 'openai' ? 'https://api.openai.com/v1/chat/completions' :
     LLM_PROVIDER === 'anthropic' ? 'https://api.anthropic.com/v1/messages' :
     (() => { throw new Error('LLM_API_URL or LLM_PROVIDER must be configured') })())

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (LLM_PROVIDER === 'openai') {
    headers['Authorization'] = `Bearer ${LLM_API_KEY}`
  } else if (LLM_PROVIDER === 'anthropic') {
    headers['x-api-key'] = LLM_API_KEY
    headers['anthropic-version'] = '2023-06-01'
  }

  // Timeout com AbortController
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`LLM API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // OpenAI format
    if (data.choices?.[0]?.message?.tool_calls?.[0]) {
      const toolCall = data.choices[0].message.tool_calls[0]
      return {
        kind: 'tool',
        toolName: toolCall.function.name,
        toolInput: JSON.parse(toolCall.function.arguments || '{}'),
        confidence: 0.9,
        reason: 'LLM function calling',
      }
    }

    // Anthropic format
    if (data.content?.[0]?.type === 'tool_use') {
      const toolUse = data.content[0]
      return {
        kind: 'tool',
        toolName: toolUse.name,
        toolInput: toolUse.input,
        confidence: 0.9,
        reason: 'LLM function calling',
      }
    }

    // Se não retornou tool call, pode ser help ou unknown
    const content = data.choices?.[0]?.message?.content || data.content?.[0]?.text || ''
    if (content.toLowerCase().includes('help') || content.toLowerCase().includes('ajuda')) {
      return { kind: 'help' }
    }

    return { kind: 'unknown' }
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      logger.warn('LLM request timeout', { timeout: LLM_TIMEOUT_MS })
      throw new Error('LLM request timeout')
    }

    logger.error('LLM API error', { error: error.message })
    throw error
  }
}

export class LLMProvider implements AIProvider {
  async decide(message: string, context: MessageContext): Promise<Decision> {
    try {
      const tools = getToolsForLLM()
      return await callLLM(message, context, tools)
    } catch (error: any) {
      logger.error('LLMProvider failed', { error: error.message })
      throw error // Será capturado pelo fallback
    }
  }
}





