/**
 * Bank Sync Service - Sincroniza transações bancárias via adapters
 */

import { prisma } from '@/shared/db'
import { integrationRepo } from '../infra/repositories/integration.repo'
import { createBankAdapter } from '../infra/adapters/bank/BankAdapterFactory'
import { logger } from '@/shared/logger'

interface SyncBankTransactionsOptions {
  orgId: string
  connectionId: string
  from?: Date
  to?: Date
}

interface SyncBankTransactionsResult {
  imported: number
  skipped: number
  errors: number
}

/**
 * Sincroniza transações bancárias de uma conexão
 */
export async function syncBankTransactions(
  options: SyncBankTransactionsOptions
): Promise<SyncBankTransactionsResult> {
  const { orgId, connectionId, from, to } = options

  try {
    // Buscar conexão
    const connection = await prisma.integrationConnection.findFirst({
      where: { id: connectionId, orgId, type: 'BANK' },
    })

    if (!connection) {
      throw new Error('Connection not found')
    }

    if (connection.status !== 'CONNECTED') {
      throw new Error('Connection is not connected')
    }

    // Criar adapter
    const adapter = createBankAdapter(connection.provider)

    // Parse auth
    const auth = connection.authJson ? JSON.parse(connection.authJson as string) : {}
    const accessToken = auth.accessToken || auth.token

    if (!accessToken) {
      throw new Error('No access token found')
    }

    // Definir período padrão (últimos 90 dias)
    const toDate = to || new Date()
    const fromDate = from || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    // Buscar contas (assumindo que temos accountId no auth ou settings)
    const settings = (connection.settingsJson as Record<string, any>) || {}
    let accountId = settings.accountId || auth.accountId

    if (!accountId) {
      // Se não temos accountId, tentar listar contas
      const accounts = await adapter.listAccounts(accessToken)
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }
      // Usar primeira conta (MVP)
      const firstAccount = accounts[0]
      accountId = firstAccount.id
    }

    // Buscar transações
    const rawTransactions = await adapter.fetchTransactions({
      accessToken,
      accountId,
      from: fromDate,
      to: toDate,
    })

    // Processar e salvar transações
    let imported = 0
    let skipped = 0
    let errors = 0

    for (const rawTx of rawTransactions) {
      try {
        // Verificar se já existe (idempotência por externalId)
        const existing = await prisma.bankTransaction.findFirst({
          where: {
            connectionId,
            externalId: rawTx.externalId,
          },
        })

        if (existing) {
          skipped++
          continue
        }

        // Criar BankTransaction
        await prisma.bankTransaction.create({
          data: {
            orgId,
            connectionId,
            externalId: rawTx.externalId,
            amountCents: rawTx.amountCents,
            currency: rawTx.currency || 'BRL',
            description: rawTx.description,
            postedAt: rawTx.postedAt,
            raw: rawTx.metadata || {},
          },
        })

        imported++
      } catch (error: any) {
        logger.error('Error importing bank transaction', {
          orgId,
          connectionId,
          externalId: rawTx.externalId,
          error: error.message,
        })
        errors++
      }
    }

    // Atualizar lastSyncAt
    await prisma.integrationConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    })

    logger.info('Bank sync completed', {
      orgId,
      connectionId,
      imported,
      skipped,
      errors,
    })

    return { imported, skipped, errors }
  } catch (error: any) {
    logger.error('Bank sync failed', {
      orgId,
      connectionId,
      error: error.message,
    })

    // Atualizar lastError
    await prisma.integrationConnection.update({
      where: { id: connectionId },
      data: { lastError: error.message },
    }).catch(() => {
      // Ignore update errors
    })

    throw error
  }
}
