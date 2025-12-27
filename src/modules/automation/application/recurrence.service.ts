/**
 * Recurrence service - Generate recurring transactions
 */

import { prisma } from '@/shared/db'
import { createAuditLog } from '@/shared/utils/audit'

function addDays(d: Date, days: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function addMonths(d: Date, months: number): Date {
  const x = new Date(d)
  x.setMonth(x.getMonth() + months)
  return x
}

function computeNextRun(r: any): Date {
  const base = new Date(r.nextRunAt)
  if (r.frequency === 'DAILY') return addDays(base, r.interval)
  if (r.frequency === 'WEEKLY') return addDays(base, 7 * r.interval)
  if (r.frequency === 'MONTHLY') {
    const nxt = addMonths(base, r.interval)
    if (r.dayOfMonth) nxt.setDate(Math.min(r.dayOfMonth, 28)) // MVP safe
    return nxt
  }
  return addDays(base, 30)
}

export const recurrenceService = {
  async runDue(orgId: string, now = new Date()) {
    const due = await prisma.recurrence.findMany({
      where: { orgId, isActive: true, nextRunAt: { lte: now } },
      orderBy: { nextRunAt: 'asc' },
    })

    let createdCount = 0

    for (const r of due) {
      // Dedup simples: se já existe transação dessa recorrência na data nextRunAt
      const dateKey = new Date(r.nextRunAt)
      dateKey.setHours(0, 0, 0, 0)

      const exists = await prisma.transaction.count({
        where: { orgId, recurrenceId: r.id, date: dateKey },
      })

      if (exists === 0) {
        const created = await prisma.transaction.create({
          data: {
            orgId,
            recurrenceId: r.id,
            type: r.type,
            status: 'CLEARED',
            date: dateKey,
            competence: null,
            amountCents: r.amountCents,
            description: r.description,
            accountId: r.accountId,
            categoryId: r.categoryId,
            costCenterId: r.costCenterId,
            clientId: r.clientId,
            vendorId: r.vendorId,
            source: 'api',
          },
        })

        createdCount++

        // Audit log
        await createAuditLog({
          organizationId: orgId,
          action: 'create',
          entityType: 'Transaction',
          entityId: created.id,
          changes: {
            new: {
              type: created.type,
              amountCents: created.amountCents,
              description: created.description,
            },
          },
          metadata: {
            source: 'api',
            recurrenceId: r.id,
            recurrenceName: r.name,
          },
        })
      }

      await prisma.recurrence.update({
        where: { id: r.id },
        data: {
          lastRunAt: now,
          nextRunAt: computeNextRun(r),
        },
      })
    }

    return { due: due.length, created: createdCount }
  },
}




