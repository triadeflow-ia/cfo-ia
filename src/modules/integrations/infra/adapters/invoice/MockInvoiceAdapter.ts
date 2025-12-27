/**
 * Mock Invoice Adapter - Para desenvolvimento e testes
 */

import { InvoiceAdapter } from './InvoiceAdapter'
import { InvoiceRaw } from '../../../domain/types'

export class MockInvoiceAdapter implements InvoiceAdapter {
  readonly provider = 'mock'

  async fetchInvoices(_params: {
    accessToken?: string
    from?: Date
    to?: Date
  }): Promise<InvoiceRaw[]> {
    // Mock: retorna 2 invoices de exemplo
    const now = new Date()
    return [
      {
        externalId: `mock-invoice-${Date.now()}-1`,
        issuedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        totalCents: 500000, // R$ 5.000,00
        customerName: 'Cliente Exemplo 1',
        customerDoc: '12.345.678/0001-90',
        metadata: {
          provider: 'mock',
          type: 'NFe',
        },
      },
      {
        externalId: `mock-invoice-${Date.now()}-2`,
        issuedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        totalCents: 120000, // R$ 1.200,00
        customerName: 'Cliente Exemplo 2',
        customerDoc: '98.765.432/0001-10',
        metadata: {
          provider: 'mock',
          type: 'NFSe',
        },
      },
    ]
  }

  async checkConnection(_accessToken?: string): Promise<{ valid: boolean; error?: string }> {
    return { valid: true }
  }
}




