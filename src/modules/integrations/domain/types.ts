/**
 * Integration Domain Types
 */

export enum IntegrationType {
  BANK = 'BANK',
  NF = 'NF',
  ACCOUNTING = 'ACCOUNTING',
  CRM = 'CRM',
}

export enum IntegrationStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}

export enum MatchStatus {
  UNMATCHED = 'UNMATCHED',
  SUGGESTED = 'SUGGESTED',
  MATCHED = 'MATCHED',
}

export interface BankTransactionRaw {
  externalId: string
  postedAt: Date
  amountCents: number
  description: string
  currency?: string
  metadata?: Record<string, any>
}

export interface InvoiceRaw {
  externalId: string
  issuedAt: Date
  totalCents: number
  customerName: string
  customerDoc?: string
  metadata?: Record<string, any>
}

export interface MatchScore {
  score: number // 0-100
  reason: {
    amountMatch?: boolean
    dateMatch?: boolean
    descriptionSimilarity?: number
  }
}



