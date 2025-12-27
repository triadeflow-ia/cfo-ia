/**
 * Ledger Service - Business logic for ledger operations
 */

import { ledgerRepo } from '../infra/ledger.repo'
import { prisma } from '@/shared/db'
import { TransactionFiltersSchema } from '../domain/validators'

export const ledgerService = {
  /**
   * List transactions with pagination and filters
   */
  async listTransactions(orgId: string, filters: any) {
    const validated = TransactionFiltersSchema.parse(filters)
    const { page = 1, pageSize = 25, from, to, ...whereFilters } = validated

    const where: any = { orgId }

    if (from) {
      where.date = { ...where.date, gte: new Date(from) }
    }
    if (to) {
      where.date = { ...where.date, lte: new Date(to) }
    }

    // Apply other filters
    if (whereFilters.type) where.type = whereFilters.type
    if (whereFilters.status) where.status = whereFilters.status
    if (whereFilters.accountId) where.accountId = whereFilters.accountId
    if (whereFilters.categoryId) where.categoryId = whereFilters.categoryId
    if (whereFilters.clientId) where.clientId = whereFilters.clientId
    if (whereFilters.vendorId) where.vendorId = whereFilters.vendorId

    if (whereFilters.q) {
      where.description = { contains: whereFilters.q, mode: 'insensitive' }
    }

    const skip = (page - 1) * pageSize

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.count({ where }),
    ])

    return {
      items,
      total,
      page,
      pageSize,
    }
  },

  /**
   * Create a new transaction
   */
  async createTransaction(orgId: string, data: any) {
    return ledgerRepo.createTransaction(orgId, data)
  },

  /**
   * Update an existing transaction
   */
  async updateTransaction(orgId: string, id: string, data: any) {
    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, orgId },
    })

    if (!existing) {
      throw new Error('Transaction not found')
    }

    return prisma.transaction.update({
      where: { id },
      data,
    })
  },

  /**
   * Get spending by category for a period
   */
  async spendByCategory(orgId: string, from: string, to: string) {
    const transactions = await prisma.transaction.findMany({
      where: {
        orgId,
        type: 'OUT',
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      include: {
        category: true,
      },
    })

    // Group by category
    const grouped = transactions.reduce((acc: any, tx: any) => {
      const categoryId = tx.categoryId || 'none'
      const categoryName = tx.category?.name || 'Sem categoria'

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId: categoryId === 'none' ? null : categoryId,
          categoryName,
          amountCents: 0,
        }
      }

      acc[categoryId].amountCents += tx.amountCents
      return acc
    }, {})

    return Object.values(grouped).sort((a: any, b: any) => b.amountCents - a.amountCents)
  },
}
