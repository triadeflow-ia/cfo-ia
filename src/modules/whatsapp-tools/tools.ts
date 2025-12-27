/**
 * WhatsApp Tools - Function calling interface for AI
 * These tools can be called by LLMs via function calling
 */

import { z } from 'zod'
import { ledgerService } from '@/modules/ledger'
import { automationService, categorizationService } from '@/modules/automation'
import { prisma } from '@/shared/db'

export interface Tool {
  name: string
  description: string
  schema: z.ZodSchema
  run: (orgId: string, input: any) => Promise<any>
}

export const tools: Record<string, Tool> = {
  listTransactions: {
    name: 'listTransactions',
    description: 'Lista transações financeiras com filtros opcionais',
    schema: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      type: z.enum(['IN', 'OUT']).optional(),
      q: z.string().optional(),
      page: z.number().optional(),
      pageSize: z.number().optional(),
    }),
    run: async (orgId: string, input: any) => {
      return ledgerService.listTransactions(orgId, input)
    },
  },

  createTransaction: {
    name: 'createTransaction',
    description: 'Cria uma nova transação financeira',
    schema: z.object({
      type: z.enum(['IN', 'OUT']),
      date: z.string(),
      amountCents: z.number().int().min(1),
      description: z.string().min(1),
      accountId: z.string(),
      categoryId: z.string().optional(),
    }),
    run: async (orgId: string, input: any) => {
      const created = await ledgerService.createTransaction(orgId, input)
      // Auto-categorize já é feito pelo ledgerService, mas garantimos aqui também
      if (created.id) {
        await categorizationService.autoCategorize(orgId, created.id)
      }
      return created
    },
  },

  updateTransaction: {
    name: 'updateTransaction',
    description: 'Atualiza uma transação existente',
    schema: z.object({
      id: z.string(),
      description: z.string().optional(),
      categoryId: z.string().optional(),
      amountCents: z.number().int().optional(),
    }),
    run: async (orgId: string, input: any) => {
      const { id, ...data } = input
      return ledgerService.updateTransaction(orgId, id, data)
    },
  },

  spendByCategory: {
    name: 'spendByCategory',
    description: 'Retorna gastos agrupados por categoria em um período',
    schema: z.object({
      from: z.string(),
      to: z.string(),
    }),
    run: async (orgId: string, input: any) => {
      return ledgerService.spendByCategory(orgId, input.from, input.to)
    },
  },

  listNotifications: {
    name: 'listNotifications',
    description: 'Lista notificações do sistema (recorrências, alertas, etc)',
    schema: z.object({
      unreadOnly: z.boolean().optional(),
    }),
    run: async (orgId: string, input: any) => {
      return automationService.listNotifications(orgId, input.unreadOnly ?? false, 20)
    },
  },

  listRecurrences: {
    name: 'listRecurrences',
    description: 'Lista recorrências cadastradas',
    schema: z.object({}),
    run: async (orgId: string) => {
      return automationService.listRecurrences(orgId)
    },
  },

  createRecurrence: {
    name: 'createRecurrence',
    description: 'Cria uma nova recorrência (despesa/receita recorrente)',
    schema: z.object({
      name: z.string(),
      frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
      nextRunAt: z.string(),
      type: z.enum(['IN', 'OUT']),
      amountCents: z.number().int().min(1),
      description: z.string(),
      accountId: z.string(),
    }),
    run: async (orgId: string, input: any) => {
      return automationService.createRecurrence(orgId, input)
    },
  },
}

/**
 * Get tools as array (for LLM function calling)
 */
export function getToolsAsArray(): Tool[] {
  return Object.values(tools)
}

/**
 * Get tool by name
 */
export function getTool(name: string): Tool | undefined {
  return tools[name]
}

/**
 * Execute a tool
 */
export async function executeTool(
  orgId: string,
  toolName: string,
  input: any
): Promise<any> {
  const tool = getTool(toolName)
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`)
  }
  return tool.run(orgId, input)
}





