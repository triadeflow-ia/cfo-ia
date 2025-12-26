/**
 * Extended tools for WhatsApp - Wrappers para comandos específicos
 */

import { tools } from './tools'
import { reportsService } from '@/modules/reports'
import { growthService } from '@/modules/growth'

/**
 * Resumo DRE do período
 */
export async function dreSummary(orgId: string, month: string) {
  const [year, monthNum] = month.split('-').map(Number)
  const from = new Date(year, monthNum - 1, 1).toISOString().slice(0, 10)
  const to = new Date(year, monthNum, 0).toISOString().slice(0, 10)

  const data = await reportsService.getDre(orgId, {
    mode: 'cash',
    from,
    to,
  })

  return {
    period: month,
    revenueCents: data.totalInCents,
    expensesCents: data.totalOutCents,
    profitCents: data.resultCents,
    topGroups: data.groups
      .sort((a, b) => (b.totalOutCents || 0) - (a.totalOutCents || 0))
      .slice(0, 3)
      .map(g => ({
        name: g.group,
        totalCents: g.totalOutCents,
      })),
  }
}

/**
 * Resumo de Cashflow
 */
export async function cashflowSummary(orgId: string, projectionDays: number = 30) {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const to = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString().slice(0, 10)

  const data = await reportsService.getCashflow(orgId, {
    from,
    to,
    projection: projectionDays,
  })

  // Encontrar 3 dias críticos (menores saldos)
  const criticalDays = [...data.days]
    .sort((a, b) => a.balanceCents - b.balanceCents)
    .slice(0, 3)

  return {
    currentBalanceCents: data.currentBalanceCents,
    minBalanceCents: data.minBalanceCents,
    maxBalanceCents: data.maxBalanceCents,
    criticalDays: criticalDays.map(d => ({
      date: d.date.toISOString().slice(0, 10),
      balanceCents: d.balanceCents,
    })),
    projectionDays,
  }
}

/**
 * Overview de crescimento (resumido)
 */
export async function growthOverview(orgId: string) {
  const data = await growthService.getOverview(orgId)
  
  return {
    activeClients: data.activeClients,
    mrrCents: data.mrrCents,
    arrCents: data.arrCents,
    churnRate: data.churnRate,
    netProfitCents: data.netProfitCents,
    momTrend: data.momTrend,
  }
}

export const extendedTools = {
  dreSummary,
  cashflowSummary,
  growthOverview,
}



