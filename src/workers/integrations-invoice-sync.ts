/**
 * Worker para sincronização de invoices (NFe/NFSe)
 * Roda diariamente (cron: 0 3 * * *) - 3h da manhã
 */

import { prisma } from '@/shared/db'
import { syncInvoices } from '@/modules/integrations/application/invoice-sync.service'
import { logger } from '@/shared/logger'

/**
 * Sincroniza invoices para todas as conexões ativas
 */
export async function processInvoiceSync() {
  logger.info('Starting invoice sync worker')

  const connections = await prisma.integrationConnection.findMany({
    where: {
      type: 'NF',
      status: 'CONNECTED',
    },
  })

  let totalImported = 0
  let totalSkipped = 0
  let totalTransactionsCreated = 0
  let totalNotificationsCreated = 0
  let totalErrors = 0

  for (const connection of connections) {
    try {
      // Sync dos últimos 30 dias
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 30)

      const result = await syncInvoices({
        orgId: connection.orgId,
        connectionId: connection.id,
        from,
        to,
      })

      totalImported += result.imported
      totalSkipped += result.skipped
      totalTransactionsCreated += result.transactionsCreated
      totalNotificationsCreated += result.notificationsCreated

      logger.info('Invoice sync completed for connection', {
        connectionId: connection.id,
        orgId: connection.orgId,
        provider: connection.provider,
        result,
      })
    } catch (error: any) {
      logger.error('Error syncing invoices for connection', {
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

  logger.info('Invoice sync worker completed', {
    totalImported,
    totalSkipped,
    totalTransactionsCreated,
    totalNotificationsCreated,
    totalErrors,
    connectionsProcessed: connections.length,
  })
}

// Se executado diretamente (para testes)
if (require.main === module) {
  processInvoiceSync()
    .then(() => {
      logger.info('Invoice sync worker finished')
      process.exit(0)
    })
    .catch(error => {
      logger.error('Invoice sync worker failed', { error: error.message })
      process.exit(1)
    })
}


