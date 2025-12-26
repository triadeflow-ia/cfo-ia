/**
 * Domain validators for Ledger module
 */

import { z } from 'zod'

export const MoneyCents = z.number().int().min(0)

export const TransactionTypeSchema = z.enum(['IN', 'OUT'])
export const TransactionStatusSchema = z.enum(['PENDING', 'CLEARED'])

export const CreateAccountSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.string().min(2).max(30),
  currency: z.string().min(3).max(6).default('BRL'),
  isActive: z.boolean().optional(),
})

export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(80),
  kind: z.enum(['EXPENSE', 'INCOME', 'BOTH']).default('EXPENSE'),
  isActive: z.boolean().optional(),
})

export const CreateCostCenterSchema = z.object({
  name: z.string().min(2).max(80),
  isActive: z.boolean().optional(),
})

export const CreateClientSchema = z.object({
  name: z.string().min(2).max(80),
  status: z.enum(['ACTIVE', 'PAUSED', 'CHURNED']).default('ACTIVE'),
})

export const CreateVendorSchema = z.object({
  name: z.string().min(2).max(80),
})

export const CreateTransactionSchema = z.object({
  type: TransactionTypeSchema,
  status: TransactionStatusSchema.optional(),
  date: z.coerce.date(),
  competence: z.coerce.date().optional().nullable(),
  amountCents: z.number().int().min(1),
  description: z.string().min(1).max(280),

  accountId: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  costCenterId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
})

export const TransactionFiltersSchema = z.object({
  q: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  type: TransactionTypeSchema.optional(),
  status: TransactionStatusSchema.optional(),

  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  costCenterId: z.string().optional(),
  clientId: z.string().optional(),
  vendorId: z.string().optional(),

  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(100).default(25),
  sort: z.enum(['date_desc', 'date_asc', 'amount_desc', 'amount_asc']).default('date_desc'),
})



