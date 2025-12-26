/**
 * Bank Adapter Factory
 */

import { BankAdapter } from './BankAdapter'
import { MockBankAdapter } from './MockBankAdapter'

// TODO: Adicionar implementações reais
// import { BelvoBankAdapter } from './BelvoBankAdapter'
// import { PlaidBankAdapter } from './PlaidBankAdapter'

export function createBankAdapter(provider: string): BankAdapter {
  switch (provider.toLowerCase()) {
    case 'mock':
      return new MockBankAdapter()
    // case 'belvo':
    //   return new BelvoBankAdapter()
    // case 'plaid':
    //   return new PlaidBankAdapter()
    default:
      throw new Error(`Unsupported bank provider: ${provider}`)
  }
}



