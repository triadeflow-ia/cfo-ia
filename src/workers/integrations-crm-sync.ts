/**
 * Worker para sincronização de CRM (clientes e contratos)
 * Roda diariamente (cron: 0 4 * * *) - 4h da manhã
 */

import { prisma } from '@/shared/db'
import { syncCrm } from '@/modules/integrations/application/crm-sync.service'
import { logger } from '@/shared/logger'

/**
 * Sincroniza clientes e contratos do CRM para todas as conexões ativas
 */
export async function processCrmSync() {
  logger.info('Starting CRM sync worker')

  const connections = await prisma.integrationConnection.findMany({
    where: {
      type: 'CRM',
      status: 'CONNECTED',
    },
  })

  let totalClientsCreated = 0
  let totalClientsUpdated = 0
  let totalContractsCreated = 0
  let totalContractsUpdated = 0
  let totalErrors = 0

  for (const connection of connections) {
    try {
      const result = await syncCrm({
        orgId: connection.orgId,
        connectionId: connection.id,
      })

      totalClientsCreated += result.clientsCreated
      totalClientsUpdated += result.clientsUpdated
      totalContractsCreated += result.contractsCreated
      totalContractsUpdated += result.contractsUpdated

      logger.info('CRM sync completed for connection', {
        connectionId: connection.id,
        orgId: connection.orgId,
        provider: connection.provider,
        result,
      })
    } catch (error: any) {
      logger.error('Error syncing CRM for connection', {
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

  logger.info('CRM sync worker completed', {
    totalClientsCreated,
    totalClientsUpdated,
    totalContractsCreated,
    totalContractsUpdated,
    totalErrors,
    connectionsProcessed: connections.length,
  })
}

// Se executado diretamente (para testes)
if (require.main === module) {
  processCrmSync()
    .then(() => {
      logger.info('CRM sync worker finished')
      process.exit(0)
    })
    .catch(error => {
      logger.error('CRM sync worker failed', { error: error.message })
      process.exit(1)
    })
}




