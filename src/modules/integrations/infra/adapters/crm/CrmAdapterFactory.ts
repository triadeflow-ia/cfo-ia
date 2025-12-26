/**
 * CRM Adapter Factory
 */

import { CrmAdapter } from '../../../crm/CrmAdapter'
import { PlaceholderCrmAdapter } from '../../../crm/CrmAdapter'

// TODO: Adicionar implementações reais
// import { KommoCrmAdapter } from './KommoCrmAdapter'
// import { GhlCrmAdapter } from './GhlCrmAdapter'

export function createCrmAdapter(provider: string): CrmAdapter {
  switch (provider.toLowerCase()) {
    case 'placeholder':
    case 'mock':
      return new PlaceholderCrmAdapter()
    // case 'kommo':
    //   return new KommoCrmAdapter()
    // case 'ghl':
    //   return new GhlCrmAdapter()
    default:
      throw new Error(`Unsupported CRM provider: ${provider}`)
  }
}


