/**
 * Worker para match engine (reconciliação de transações bancárias)
 * Roda a cada 10 minutos (cron: */10 * * * *)
 */

import { prisma } from '@/shared/db'
import { generateMatchSuggestions } from '@/modules/integrations/application/match-engine.service'
import { logger } from '@/shared/logger'

/**
 * Executa match engine para todas as organizações com transações não matchadas
 */
export async function processMatchEngine() {
  logger.info('Starting match engine worker')

  // Buscar organizações com BankTransactions não matchadas
  const orgsWithUnmatched = await prisma.bankTransaction.groupBy({
    by: ['orgId'],
    where: {
      matchStatus: {
        in: ['UNMATCHED', 'SUGGESTED'],
      },
    },
    _count: {
      id: true,
    },
  })

  let totalGenerated = 0
  let totalAutoMatched = 0
  let totalOrgsProcessed = 0
  let totalErrors = 0

  for (const org of orgsWithUnmatched) {
    try {
      const result = await generateMatchSuggestions(org.orgId, {
        minScore: 60, // Apenas matches com score >= 60
      })

      totalGenerated += result.generated
      totalAutoMatched += result.autoMatched

      if (result.generated > 0 || result.autoMatched > 0) {
        logger.info('Match engine completed for org', {
          orgId: org.orgId,
          generated: result.generated,
          autoMatched: result.autoMatched,
          unmatchedCount: org._count.id,
        })
      }

      totalOrgsProcessed++
    } catch (error: any) {
      logger.error('Error running match engine for org', {
        orgId: org.orgId,
        error: error.message,
      })
      totalErrors++
    }
  }

  logger.info('Match engine worker completed', {
    totalGenerated,
    totalAutoMatched,
    totalOrgsProcessed,
    totalErrors,
  })
}

// Se executado diretamente (para testes)
if (require.main === module) {
  processMatchEngine()
    .then(() => {
      logger.info('Match engine worker finished')
      process.exit(0)
    })
    .catch(error => {
      logger.error('Match engine worker failed', { error: error.message })
      process.exit(1)
    })
}


