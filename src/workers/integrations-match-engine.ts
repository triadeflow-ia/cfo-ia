/**
 * Worker para match engine (reconciliação de transações)
 * Roda após cada sync de banco
 */

import { generateMatchSuggestions } from '@/modules/integrations/application/match-engine.service'
import { logger } from '@/shared/logger'
import { prisma } from '@/shared/db'

/**
 * Processa match engine para todas as organizações
 */
export async function processMatchEngine(orgId?: string): Promise<void> {
  const where = orgId ? { id: orgId } : {}
  
  const organizations = await prisma.organization.findMany({
    where,
  })

  for (const org of organizations) {
    try {
      await generateMatchSuggestions(org.id)
      logger.info('Match engine completed', { orgId: org.id })
    } catch (error: any) {
      logger.error('Match engine failed', {
        orgId: org.id,
        error: error.message,
      })
    }
  }
}
