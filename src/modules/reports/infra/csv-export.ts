/**
 * CSV export utilities for reports
 */

export function exportDreToCsv(data: {
  groups: Array<{
    group: string
    categories: Array<{ name: string; inCents: number; outCents: number }>
    totalInCents: number
    totalOutCents: number
  }>
  totalInCents: number
  totalOutCents: number
  resultCents: number
}): string {
  const lines: string[] = []
  lines.push('Grupo,Categoria,Receitas,Despesas,Saldo')

  for (const group of data.groups) {
    for (const cat of group.categories) {
      const inValue = (cat.inCents / 100).toFixed(2).replace('.', ',')
      const outValue = (cat.outCents / 100).toFixed(2).replace('.', ',')
      const balance = ((cat.inCents - cat.outCents) / 100).toFixed(2).replace('.', ',')
      lines.push(`${group.group},${cat.name},${inValue},${outValue},${balance}`)
    }
    // Linha de subtotal do grupo
    const groupIn = (group.totalInCents / 100).toFixed(2).replace('.', ',')
    const groupOut = (group.totalOutCents / 100).toFixed(2).replace('.', ',')
    const groupBalance = ((group.totalInCents - group.totalOutCents) / 100).toFixed(2).replace('.', ',')
    lines.push(`${group.group},TOTAL ${group.group},${groupIn},${groupOut},${groupBalance}`)
    lines.push('') // Linha em branco
  }

  // Totais gerais
  lines.push('TOTAL GERAL,,')
  lines.push(`,,${(data.totalInCents / 100).toFixed(2).replace('.', ',')},${(data.totalOutCents / 100).toFixed(2).replace('.', ',')},${(data.resultCents / 100).toFixed(2).replace('.', ',')}`)

  return lines.join('\n')
}

export function exportCashflowToCsv(data: {
  days: Array<{ date: Date; inCents: number; outCents: number; balanceCents: number }>
  currentBalanceCents: number
  minBalanceCents: number
  maxBalanceCents: number
}): string {
  const lines: string[] = []
  lines.push('Data,Entradas,Saídas,Saldo Acumulado')

  for (const day of data.days) {
    const date = day.date.toLocaleDateString('pt-BR')
    const inValue = (day.inCents / 100).toFixed(2).replace('.', ',')
    const outValue = (day.outCents / 100).toFixed(2).replace('.', ',')
    const balance = (day.balanceCents / 100).toFixed(2).replace('.', ',')
    lines.push(`${date},${inValue},${outValue},${balance}`)
  }

  lines.push('')
  lines.push(`Saldo Atual,${(data.currentBalanceCents / 100).toFixed(2).replace('.', ',')}`)
  lines.push(`Mínimo,${(data.minBalanceCents / 100).toFixed(2).replace('.', ',')}`)
  lines.push(`Máximo,${(data.maxBalanceCents / 100).toFixed(2).replace('.', ',')}`)

  return lines.join('\n')
}

export function exportBudgetVsActualToCsv(data: {
  items: Array<{
    categoryName: string
    costCenterName: string | null
    budgetCents: number
    actualCents: number
    varianceCents: number
    variancePercent: number
  }>
  totalBudgetCents: number
  totalActualCents: number
  totalVarianceCents: number
}): string {
  const lines: string[] = []
  lines.push('Categoria,Centro de Custo,Orçado,Realizado,Variação,Variação %')

  for (const item of data.items) {
    const budget = (item.budgetCents / 100).toFixed(2).replace('.', ',')
    const actual = (item.actualCents / 100).toFixed(2).replace('.', ',')
    const variance = (item.varianceCents / 100).toFixed(2).replace('.', ',')
    const variancePct = item.variancePercent.toFixed(2).replace('.', ',')
    lines.push(`${item.categoryName},${item.costCenterName || '-'},${budget},${actual},${variance},${variancePct}%`)
  }

  lines.push('')
  lines.push('TOTAL,,')
  lines.push(`,,${(data.totalBudgetCents / 100).toFixed(2).replace('.', ',')},${(data.totalActualCents / 100).toFixed(2).replace('.', ',')},${(data.totalVarianceCents / 100).toFixed(2).replace('.', ',')}`)

  return lines.join('\n')
}



