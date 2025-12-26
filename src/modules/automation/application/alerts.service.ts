/**
 * Alerts service - Generate notifications
 */

import { automationRepo } from '../infra/automation.repo'

export const alertsService = {
  async runDaily(orgId: string) {
    const now = new Date()
    const in3days = new Date(now)
    in3days.setDate(in3days.getDate() + 3)

    // 1) Recorrências próximas
    const upcoming = await automationRepo.listDueRecurrences(orgId, in3days)
    // Filter apenas as que estão próximas (não as que já venceram)
    const upcomingFiltered = upcoming.filter((r) => {
      const nextRun = new Date(r.nextRunAt)
      return nextRun > now && nextRun <= in3days
    })

    // 2) Anomalia simples: OUT do dia > 2x média diária últimos 30 dias
    const { prisma } = await import('@/shared/db')
    const from30 = new Date(now)
    from30.setDate(from30.getDate() - 30)

    const total30 = await prisma.transaction.aggregate({
      where: { orgId, type: 'OUT', date: { gte: from30, lte: now } },
      _sum: { amountCents: true },
    })

    const avgDaily = (total30._sum.amountCents ?? 0) / 30

    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const todayOut = await prisma.transaction.aggregate({
      where: { orgId, type: 'OUT', date: { gte: todayStart, lte: now } },
      _sum: { amountCents: true },
    })

    const notifications: Array<{
      type: string
      severity: string
      title: string
      body: string
      metadata?: any
    }> = []

    for (const r of upcomingFiltered) {
      const daysUntil = Math.ceil(
        (new Date(r.nextRunAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      notifications.push({
        type: 'RECURRENCE_DUE',
        severity: 'INFO',
        title: 'Recorrência próxima',
        body: `${r.name} vence em ${daysUntil} dia(s) (${new Date(r.nextRunAt).toLocaleDateString('pt-BR')})`,
        metadata: { recurrenceId: r.id, nextRunAt: r.nextRunAt },
      })
    }

    const todayCents = todayOut._sum.amountCents ?? 0
    if (avgDaily > 0 && todayCents > avgDaily * 2) {
      notifications.push({
        type: 'ANOMALY_SPEND',
        severity: 'WARNING',
        title: 'Gasto fora do padrão',
        body: `As saídas de hoje (${(todayCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) estão ${((todayCents / avgDaily - 1) * 100).toFixed(0)}% acima da média diária.`,
        metadata: {
          todayCents,
          avgDailyCents: Math.round(avgDaily),
        },
      })
    }

    if (notifications.length > 0) {
      await automationRepo.createNotifications(orgId, notifications)
    }

    return { upcoming: upcomingFiltered.length, notifications: notifications.length }
  },
}



