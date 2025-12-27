/**
 * Reports Service - Business logic for reports
 */

import { prisma } from '@/shared/db'

export const reportsService = {
  /**
   * Get cashflow report
   */
  async getCashflow(orgId: string, options: { from: string; to: string; projection: number }) {
    const { from, to, projection } = options
    const fromDate = new Date(from)
    const toDate = new Date(to)

    // Get all transactions in period
    const transactions = await prisma.transaction.findMany({
      where: {
        orgId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
        status: 'CLEARED',
      },
      orderBy: { date: 'asc' },
    })

    // Calculate current balance from transactions
    // For MVP, we'll calculate from cleared transactions before the period
    const balanceTransactions = await prisma.transaction.findMany({
      where: {
        orgId,
        date: { lt: fromDate },
        status: 'CLEARED',
      },
    })
    const currentBalanceCents = balanceTransactions.reduce(
      (sum, tx) => sum + (tx.type === 'IN' ? tx.amountCents : -tx.amountCents),
      0
    )

    // Group by date
    const daysMap = new Map<string, { inCents: number; outCents: number }>()

    // Initialize all days in range
    const current = new Date(fromDate)
    while (current <= toDate) {
      const key = current.toISOString().slice(0, 10)
      daysMap.set(key, { inCents: 0, outCents: 0 })
      current.setDate(current.getDate() + 1)
    }

    // Add transactions
    for (const tx of transactions) {
      const key = tx.date.toISOString().slice(0, 10)
      const day = daysMap.get(key) || { inCents: 0, outCents: 0 }
      if (tx.type === 'IN') {
        day.inCents += tx.amountCents
      } else {
        day.outCents += tx.amountCents
      }
      daysMap.set(key, day)
    }

    // Convert to array and calculate running balance
    const days = Array.from(daysMap.entries())
      .map(([dateStr, day]) => ({
        date: new Date(dateStr),
        inCents: day.inCents,
        outCents: day.outCents,
        balanceCents: 0, // Will be calculated
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Calculate running balance
    let runningBalance = currentBalanceCents
    for (const day of days) {
      runningBalance += day.inCents - day.outCents
      day.balanceCents = runningBalance
    }

    const balances = days.map(d => d.balanceCents)
    const minBalanceCents = balances.length > 0 ? Math.min(...balances) : 0
    const maxBalanceCents = balances.length > 0 ? Math.max(...balances) : 0

    return {
      currentBalanceCents,
      minBalanceCents,
      maxBalanceCents,
      days,
    }
  },

  /**
   * Get DRE report
   */
  async getDre(orgId: string, options: { mode: 'cash' | 'accrual'; from: string; to: string }) {
    const { from, to, mode } = options
    const fromDate = new Date(from)
    const toDate = new Date(to)

    const where: any = {
      orgId,
      date: {
        gte: fromDate,
        lte: toDate,
      },
    }

    if (mode === 'cash') {
      where.status = 'CLEARED'
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
    })

    // Get all categories with their DRE groups
    const categories = await prisma.category.findMany({
      where: { orgId },
    })
    const categoryToGroup = new Map(
      categories.map(cat => [cat.id, cat.dreGroup || 'OTHER'])
    )

    // Group by DRE group
    const groupsMap = new Map<string, { totalInCents: number; totalOutCents: number }>()

    for (const tx of transactions) {
      const groupName = tx.categoryId ? categoryToGroup.get(tx.categoryId) || 'OTHER' : 'OTHER'
      const group = groupsMap.get(groupName) || { totalInCents: 0, totalOutCents: 0 }

      if (tx.type === 'IN') {
        group.totalInCents += tx.amountCents
      } else {
        group.totalOutCents += tx.amountCents
      }

      groupsMap.set(groupName, group)
    }

    const groups = Array.from(groupsMap.entries()).map(([group, totals]) => ({
      group,
      ...totals,
    }))

    const totalInCents = groups.reduce((sum, g) => sum + g.totalInCents, 0)
    const totalOutCents = groups.reduce((sum, g) => sum + g.totalOutCents, 0)
    const resultCents = totalInCents - totalOutCents

    return {
      totalInCents,
      totalOutCents,
      resultCents,
      groups,
    }
  },
}
