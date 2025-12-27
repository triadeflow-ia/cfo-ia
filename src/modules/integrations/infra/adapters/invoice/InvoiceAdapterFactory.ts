/**
 * Invoice Adapter Factory
 */

import { InvoiceAdapter } from './InvoiceAdapter'
import { MockInvoiceAdapter } from './MockInvoiceAdapter'

// TODO: Adicionar implementações reais
// import { NFeAdapter } from './NFeAdapter'
// import { NFSeAdapter } from './NFSeAdapter'

export function createInvoiceAdapter(provider: string): InvoiceAdapter {
  switch (provider.toLowerCase()) {
    case 'mock':
      return new MockInvoiceAdapter()
    // case 'nfe':
    //   return new NFeAdapter()
    // case 'nfse':
    //   return new NFSeAdapter()
    default:
      throw new Error(`Unsupported invoice provider: ${provider}`)
  }
}




