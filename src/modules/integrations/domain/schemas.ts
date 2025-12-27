/**
 * Integration Domain Schemas (Zod)
 */

import { z } from 'zod'

export const IntegrationTypeSchema = z.enum(['BANK', 'NF', 'ACCOUNTING', 'CRM'])
export const IntegrationStatusSchema = z.enum(['CONNECTED', 'DISCONNECTED', 'ERROR'])
export const MatchStatusSchema = z.enum(['UNMATCHED', 'SUGGESTED', 'MATCHED'])

export const CreateIntegrationConnectionSchema = z.object({
  type: IntegrationTypeSchema,
  provider: z.string().min(1).max(50),
  authJson: z.record(z.any()).optional(),
  settingsJson: z.record(z.any()).optional(),
})

export const UpdateIntegrationConnectionSchema = z.object({
  status: IntegrationStatusSchema.optional(),
  authJson: z.record(z.any()).optional(),
  settingsJson: z.record(z.any()).optional(),
})

export const BankTransactionRawSchema = z.object({
  externalId: z.string().min(1),
  postedAt: z.coerce.date(),
  amountCents: z.number().int(),
  description: z.string().min(1),
  currency: z.string().default('BRL'),
  metadata: z.record(z.any()).optional(),
})

export const InvoiceRawSchema = z.object({
  externalId: z.string().min(1),
  issuedAt: z.coerce.date(),
  totalCents: z.number().int().min(0),
  customerName: z.string().min(1),
  customerDoc: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional(),
})

export const MatchSuggestionSchema = z.object({
  bankTransactionId: z.string(),
  transactionId: z.string(),
  score: z.number().int().min(0).max(100),
  reason: z.record(z.any()).optional(),
})





