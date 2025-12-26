/**
 * Mock Bank Adapter - Para desenvolvimento/testes
 */

import { BankAdapter, BankAccount } from './BankAdapter'
import { BankTransactionRaw } from '../../../domain/types'

export class MockBankAdapter implements BankAdapter {
  readonly provider = 'mock'

  async connect(params: { auth: Record<string, any>; settings?: Record<string, any> }) {
    // Mock: simula conexão bem-sucedida
    return {
      accountId: 'mock_account_123',
      accessToken: 'mock_token_' + Date.now(),
    }
  }

  async listAccounts(accessToken: string): Promise<BankAccount[]> {
    return [
      {
        id: 'mock_account_123',
        name: 'Conta Corrente Mock',
        type: 'CHECKING',
        currency: 'BRL',
        balanceCents: 5000000, // R$ 50.000,00
      },
    ]
  }

  async fetchTransactions(params: {
    accessToken: string
    accountId: string
    from: Date
    to: Date
  }): Promise<BankTransactionRaw[]> {
    // Mock: retorna algumas transações de exemplo
    const transactions: BankTransactionRaw[] = []

    // Gerar algumas transações de exemplo no período
    const days = Math.ceil((params.to.getTime() - params.from.getTime()) / (1000 * 60 * 60 * 24))
    const count = Math.min(days, 30) // Máximo 30 transações

    for (let i = 0; i < count; i++) {
      const date = new Date(params.from)
      date.setDate(date.getDate() + i)

      transactions.push({
        externalId: `mock_tx_${i}_${date.getTime()}`,
        postedAt: date,
        amountCents: (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 100000), // -R$ 1000 a +R$ 1000
        description: `Transação Mock ${i + 1}`,
        currency: 'BRL',
        metadata: {
          category: Math.random() > 0.5 ? 'income' : 'expense',
        },
      })
    }

    return transactions
  }

  async checkConnection(accessToken: string): Promise<{ valid: boolean; error?: string }> {
    return { valid: accessToken.startsWith('mock_token_') }
  }
}



