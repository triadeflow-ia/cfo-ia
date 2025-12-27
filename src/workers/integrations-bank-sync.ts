/**
 * Worker para sincronização de transações bancárias
 * Roda diariamente (cron: 0 2 * * *) - 2h da manhã
 */

import { prisma } from '@/shared/db'
import { syncBankAndMatch } from '@/modules/integrations/application/integration.service'
import { logger } from '@/shared/logger'

/**
 * Sincroniza transações bancárias para todas as conexões ativas
 */
export async function processBankSync() {
  logger.info('Starting bank sync worker')

  const connections = await prisma.integrationConnection.findMany({
    where: {
      type: 'BANK',
      status: 'CONNECTED',
    },
  })

  let totalImported = 0
  let totalSkipped = 0
  let totalErrors = 0
  let totalMatched = 0

  for (const connection of connections) {
    try {
      // Sync dos últimos 7 dias (para não sobrecarregar na primeira vez)
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 7)

      const result = await syncBankAndMatch({
        orgId: connection.orgId,
        connectionId: connection.id,
        from,
        to,
      })

      totalImported += result.imported
      totalSkipped += result.skipped
      totalMatched += result.matches.autoMatched + result.matches.suggested

      logger.info('Bank sync completed for connection', {
        connectionId: connection.id,
        orgId: connection.orgId,
        provider: connection.provider,
        imported: result.imported,
        skipped: result.skipped,
        matched: result.matches,
      })
    } catch (error: any) {
      logger.error('Error syncing bank for connection', {
        connectionId: connection.id,
        orgId: connection.orgId,
        error: error.message,
      })
      totalErrors++

      // Atualizar lastError
      await prisma.integrationConnection.update({
        where: { id: connection.id },
        data: { lastError: error.message },
      })
    }
  }

  logger.info('Bank sync worker completed', {
    totalImported,
    totalSkipped,
    totalErrors,
    totalMatched,
    connectionsProcessed: connections.length,
  })
}

// Se executado diretamente (para testes)
if (require.main === module) {
  processBankSync()
    .then(() => {
      logger.info('Bank sync worker finished')
      process.exit(0)
    })
    .catch(error => {
      logger.error('Bank sync worker failed', { error: error.message })
      process.exit(1)
    })
}




