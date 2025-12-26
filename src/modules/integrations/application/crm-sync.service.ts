/**
 * CRM Sync Service
 * Sincroniza clientes e contratos do CRM
 */

import { integrationRepo } from '../infra/repositories/integration.repo'
import { createCrmAdapter } from '../infra/adapters/crm/CrmAdapterFactory'
import { ledgerRepo } from '@/modules/ledger/infra/ledger.repo'
import { prisma } from '@/shared/db'
import { logger } from '@/shared/logger'

interface SyncCrmOptions {
  orgId: string
  connectionId: string
}

interface SyncCrmResult {
  clientsCreated: number
  clientsUpdated: number
  contractsCreated: number
  contractsUpdated: number
  errors: number
}

/**
 * Sincroniza clientes e contratos do CRM
 */
export async function syncCrm(options: SyncCrmOptions): Promise<SyncCrmResult> {
  const { orgId, connectionId } = options

  // Buscar connection
  const connection = await integrationRepo.findConnection(orgId, connectionId)
  if (!connection) {
    throw new Error('Connection not found')
  }

  if (connection.type !== 'CRM') {
    throw new Error('Connection is not a CRM provider')
  }

  // Criar adapter
  const adapter = createCrmAdapter(connection.provider)

  // Buscar clientes do CRM
  let crmClients
  try {
    crmClients = await adapter.pullClients(orgId)
  } catch (error: any) {
    logger.error('Failed to fetch clients from CRM adapter', {
      error: error.message,
      connectionId,
      provider: connection.provider,
    })
    throw error
  }

  // Buscar contratos do CRM
  let crmContracts
  try {
    crmContracts = await adapter.pullContracts(orgId)
  } catch (error: any) {
    logger.error('Failed to fetch contracts from CRM adapter', {
      error: error.message,
      connectionId,
      provider: connection.provider,
    })
    throw error
  }

  let clientsCreated = 0
  let clientsUpdated = 0
  let contractsCreated = 0
  let contractsUpdated = 0
  let errors = 0

  // Sincronizar clientes
  const existingClients = await ledgerRepo.listClients(orgId)
  const clientMap = new Map(existingClients.map(c => [c.name.toLowerCase(), c]))

  for (const crmClient of crmClients) {
    try {
      const normalizedName = crmClient.name.toLowerCase()
      const existing = clientMap.get(normalizedName)

      if (existing) {
        // Atualizar status se mudou
        if (existing.status !== crmClient.status) {
          await ledgerRepo.updateClient(orgId, existing.id, {
            status: crmClient.status,
          })
          clientsUpdated++
        }
      } else {
        // Criar novo cliente
        await ledgerRepo.createClient(orgId, {
          name: crmClient.name,
          status: crmClient.status,
        })
        clientsCreated++
      }
    } catch (error: any) {
      logger.error('Failed to sync CRM client', {
        error: error.message,
        clientId: crmClient.id,
        connectionId,
      })
      errors++
    }
  }

  // Buscar clientes atualizados (com IDs corretos)
  const updatedClients = await ledgerRepo.listClients(orgId)
  const updatedClientMap = new Map(updatedClients.map(c => [c.name.toLowerCase(), c]))

  // Sincronizar contratos
  // Criar map de CRM client ID -> Client local (por nome)
  const crmClientMap = new Map(crmClients.map(c => [c.id, c]))
  
  for (const crmContract of crmContracts) {
    try {
      // Buscar cliente do CRM pelo ID do contrato
      const crmClient = crmClientMap.get(crmContract.clientId)
      if (!crmClient) {
        logger.warn('CRM contract references unknown CRM client', {
          contractId: crmContract.id,
          clientId: crmContract.clientId,
          connectionId,
        })
        errors++
        continue
      }

      // Buscar cliente local pelo nome (que acabamos de sincronizar)
      const client = updatedClientMap.get(crmClient.name.toLowerCase())
      if (!client) {
        logger.warn('CRM contract references client not found locally', {
          contractId: crmContract.id,
          crmClientName: crmClient.name,
          connectionId,
        })
        errors++
        continue
      }

      // Verificar se contrato já existe (por clientId + mrrCents + startAt similar)
      const existingContracts = await prisma.clientContract.findMany({
        where: {
          orgId,
          clientId: client.id,
          source: 'crm',
        },
      })

      // Buscar contrato existente por overlap de datas ou MRR similar
      const existing = existingContracts.find(c => {
        const startDiff = Math.abs(
          c.startAt.getTime() - new Date(crmContract.startAt).getTime()
        )
        const mrrDiff = Math.abs(c.mrrCents - crmContract.mrrCents)
        return startDiff < 7 * 24 * 60 * 60 * 1000 && mrrDiff < 100 // 7 dias e R$ 1,00 de diferença
      })

      if (existing) {
        // Atualizar contrato existente
        await prisma.clientContract.update({
          where: { id: existing.id },
          data: {
            status: crmContract.status,
            mrrCents: crmContract.mrrCents,
            endAt: crmContract.endAt ? new Date(crmContract.endAt) : null,
            updatedAt: new Date(),
          },
        })
        contractsUpdated++
      } else {
        // Criar novo contrato
        await prisma.clientContract.create({
          data: {
            orgId,
            clientId: client.id,
            status: crmContract.status,
            startAt: new Date(crmContract.startAt),
            endAt: crmContract.endAt ? new Date(crmContract.endAt) : null,
            mrrCents: crmContract.mrrCents,
            currency: crmContract.currency || 'BRL',
            billingDay: crmContract.billingDay || null,
            source: 'crm',
          },
        })
        contractsCreated++
      }
    } catch (error: any) {
      logger.error('Failed to sync CRM contract', {
        error: error.message,
        contractId: crmContract.id,
        connectionId,
      })
      errors++
    }
  }

  // Atualizar lastSyncAt
  await integrationRepo.updateConnection(orgId, connectionId, {
    lastSyncAt: new Date(),
  })

  return {
    clientsCreated,
    clientsUpdated,
    contractsCreated,
    contractsUpdated,
    errors,
  }
}

