/**
 * Growth domain schemas
 */

import { z } from 'zod'

export const CreateContractSchema = z.object({
  clientId: z.string(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']),
  monthlyAmountCents: z.number(),
  startDate: z.string(),
  endDate: z.string().optional(),
})

export const UpdateContractSchema = CreateContractSchema.partial()

export const CreateGoalSchema = z.object({
  metric: z.enum(['MRR', 'ARR', 'ACTIVE_CLIENTS', 'TICKET_MEDIO']),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  targetValue: z.number(),
  targetDate: z.string(),
})

export const UpdateGoalSchema = CreateGoalSchema.partial()
