/**
 * CRM Adapter Interface
 * 
 * Interface para integração com sistemas CRM (CRM, Pipedrive, HubSpot, etc.)
 * Implementações específicas devem seguir este contrato.
 */

import { z } from 'zod'

export interface CrmClient {
  id: string
  name: string
  email?: string
  phone?: string
  status: 'ACTIVE' | 'PAUSED' | 'CHURNED'
  metadata?: Record<string, any>
}

export interface CrmContract {
  id: string
  clientId: string // ID do cliente no CRM (usado para buscar o CrmClient)
  status: 'ACTIVE' | 'PAUSED' | 'CANCELED'
  startAt: Date | string // Pode ser Date ou string ISO
  endAt?: Date | string | null
  mrrCents: number
  currency: string
  billingDay?: number | null
  metadata?: Record<string, any>
}

export interface CrmAdapter {
  /**
   * Puxar clientes do CRM
   */
  pullClients(orgId: string): Promise<CrmClient[]>

  /**
   * Puxar contratos do CRM
   */
  pullContracts(orgId: string): Promise<CrmContract[]>

  /**
   * Enviar status de cliente atualizado para o CRM
   */
  pushClientStatus(
    orgId: string,
    clientId: string,
    status: 'ACTIVE' | 'PAUSED' | 'CHURNED'
  ): Promise<void>

  /**
   * Sincronizar mapeamento de transações (vincular receitas a clientes)
   */
  syncTransactionsMapping(
    orgId: string,
    transactionIds: string[],
    clientMapping: Record<string, string> // transactionId -> clientId
  ): Promise<void>
}

/**
 * Placeholder implementation (não faz nada)
 * Usado quando não há integração ativa
 */
export class PlaceholderCrmAdapter implements CrmAdapter {
  async pullClients(): Promise<CrmClient[]> {
    return []
  }

  async pullContracts(): Promise<CrmContract[]> {
    return []
  }

  async pushClientStatus(): Promise<void> {
    // No-op
  }

  async syncTransactionsMapping(): Promise<void> {
    // No-op
  }
}


