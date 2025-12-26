/**
 * AI Provider Factory - Cria provider baseado em configuração
 */

import { AIProvider } from '../domain/types'
import { HeuristicAIProvider } from './heuristic-provider'
import { LLMProvider } from './llm-provider'
import { prisma } from '@/shared/db'
import { logger } from '@/shared/logger'

/**
 * Cria AI Provider baseado em configuração da org
 */
export async function createAIProvider(orgId: string): Promise<AIProvider> {
  const settings = await prisma.whatsappSettings.findUnique({
    where: { orgId },
  })

  const useLLM = settings?.llmEnabled && settings?.provider === 'llm'
  
  if (useLLM && process.env.LLM_API_KEY) {
    try {
      return new LLMProvider()
    } catch (error: any) {
      logger.warn('Failed to create LLMProvider, falling back to heuristic', {
        orgId,
        error: error.message,
      })
      return new HeuristicAIProvider()
    }
  }

  return new HeuristicAIProvider()
}

/**
 * Decide com fallback automático
 */
export async function decideWithFallback(
  message: string,
  context: any,
  orgId: string
): Promise<ReturnType<AIProvider['decide']>> {
  try {
    const provider = await createAIProvider(orgId)
    return await provider.decide(message, context)
  } catch (error: any) {
    logger.warn('AI Provider failed, using heuristic fallback', {
      error: error.message,
      orgId,
    })
    const fallback = new HeuristicAIProvider()
    return await fallback.decide(message, context)
  }
}



