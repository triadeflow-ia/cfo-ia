/**
 * HeuristicAIProvider - Implementação baseada em regex/patterns
 * Usado como fallback e modo padrão
 */

import { AIProvider, Decision, MessageContext } from '../domain/types'
import { IntentRouter } from '@/modules/whatsapp/application/intent-router'

export class HeuristicAIProvider implements AIProvider {
  async decide(message: string, context: MessageContext): Promise<Decision> {
    const parsed = IntentRouter.parse(message)
    
    if (!parsed) {
      return { kind: 'unknown' }
    }

    if (parsed.tool === 'help') {
      return { kind: 'help' }
    }

    return {
      kind: 'tool',
      toolName: parsed.tool,
      toolInput: parsed.input,
      confidence: 0.8, // Heurística tem confiança média
      reason: 'Parsed via heuristic patterns',
    }
  }
}



