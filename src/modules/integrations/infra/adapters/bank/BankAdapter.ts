/**
 * Bank Adapter Interface
 * Implementações específicas: BelvoBankAdapter, PlaidBankAdapter, etc.
 */

import { BankTransactionRaw } from '../../../domain/types'

export interface BankAccount {
  id: string
  name: string
  type: string // CHECKING, SAVINGS, etc.
  currency: string
  balanceCents?: number
}

export interface BankAdapter {
  /**
   * Nome do provider (ex: "belvo", "plaid")
   */
  readonly provider: string

  /**
   * Conectar conta (retorna link/URL para OAuth se necessário)
   */
  connect(params: {
    auth: Record<string, any>
    settings?: Record<string, any>
  }): Promise<{ accountId?: string; linkUrl?: string; accessToken?: string }>

  /**
   * Listar contas conectadas
   */
  listAccounts(accessToken: string): Promise<BankAccount[]>

  /**
   * Buscar transações de uma conta
   */
  fetchTransactions(params: {
    accessToken: string
    accountId: string
    from: Date
    to: Date
  }): Promise<BankTransactionRaw[]>

  /**
   * Verificar status da conexão
   */
  checkConnection(accessToken: string): Promise<{ valid: boolean; error?: string }>
}





