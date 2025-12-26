/**
 * Invoice Adapter Interface
 * Implementações específicas: NFeAdapter, NFSeAdapter, etc.
 */

import { InvoiceRaw } from '../../../domain/types'

export interface InvoiceAdapter {
  /**
   * Nome do provider (ex: "nfe", "nfse", "mock")
   */
  readonly provider: string

  /**
   * Buscar invoices (via webhook ou polling)
   */
  fetchInvoices(params: {
    accessToken?: string
    from?: Date
    to?: Date
  }): Promise<InvoiceRaw[]>

  /**
   * Verificar status da conexão
   */
  checkConnection(accessToken?: string): Promise<{ valid: boolean; error?: string }>
}


