/**
 * Invoice Sync Service - Sincroniza notas fiscais via adapters
 */

import { prisma } from '@/shared/db'
import { logger } from '@/shared/logger'

interface SyncInvoicesOptions {
  orgId: string
  connectionId: string
  from?: Date
  to?: Date
}

interface SyncInvoicesResult {
  imported: number
  skipped: number
  errors: number
  transactionsCreated: number
  notificationsCreated: number
}

/**
 * Sincroniza notas fiscais de uma conexão
 */
export async function syncInvoices(
  options: SyncInvoicesOptions
): Promise<SyncInvoicesResult> {
  const { orgId, connectionId, from, to } = options

  try {
    // Buscar conexão
    const connection = await prisma.integrationConnection.findFirst({
      where: { id: connectionId, orgId, type: 'NF' },
    })

    if (!connection) {
      throw new Error('Connection not found')
    }

    if (connection.status !== 'CONNECTED') {
      throw new Error('Connection is not connected')
    }

    // TODO: Implement invoice adapter
    logger.info('Invoice sync not implemented yet', { orgId, connectionId })

    return { imported: 0, skipped: 0, errors: 0, transactionsCreated: 0, notificationsCreated: 0 }
  } catch (error: any) {
    logger.error('Invoice sync failed', {
      orgId,
      connectionId,
      error: error.message,
    })

    throw error
  }
}
