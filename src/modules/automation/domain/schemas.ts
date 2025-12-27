/**
 * Domain schemas for Automation module
 */

import { z } from 'zod'

export const RuleMatchTypeSchema = z.enum(['CONTAINS', 'REGEX', 'STARTS_WITH', 'ENDS_WITH'])

export const RecurrenceFrequencySchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY'])

export const CreateCategorizationRuleSchema = z.object({
  name: z.string().min(2).max(80),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(1).max(1000).optional(),
  matchType: RuleMatchTypeSchema,
  pattern: z.string().min(1).max(200),

  vendorId: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  appliesTo: z.enum(['IN', 'OUT']).optional().nullable(),

  categoryId: z.string().optional().nullable(),
  costCenterId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
})

export const CreateRecurrenceSchema = z.object({
  name: z.string().min(2).max(80),
  isActive: z.boolean().optional(),

  frequency: RecurrenceFrequencySchema,
  interval: z.number().int().min(1).max(12).default(1),

  dayOfWeek: z.number().int().min(0).max(6).optional().nullable(),
  dayOfMonth: z.number().int().min(1).max(31).optional().nullable(),

  nextRunAt: z.coerce.date(),

  type: z.enum(['IN', 'OUT']),
  amountCents: z.number().int().min(1),
  description: z.string().min(1).max(280),

  accountId: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  costCenterId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
})





