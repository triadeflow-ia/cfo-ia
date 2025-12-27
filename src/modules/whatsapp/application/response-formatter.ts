/**
 * Response Formatter - Formata respostas para WhatsApp
 */

export class ResponseFormatter {
  /**
   * Formata resposta padrão (headline + dados + sugestões)
   */
  static format(toolName: string, result: any): string {
    switch (toolName) {
      case 'growthOverview':
        return this.formatGrowthOverview(result)
      case 'dreSummary':
        return this.formatDreSummary(result)
      case 'spendByCategory':
        return this.formatSpendByCategory(result)
      case 'cashflowSummary':
        return this.formatCashflowSummary(result)
      case 'listNotifications':
        return this.formatNotifications(result)
      case 'createTransaction':
        return this.formatCreateTransaction(result)
      default:
        return this.formatGeneric(result)
    }
  }

  private static formatGrowthOverview(result: any): string {
    const mrr = (result.mrrCents || 0) / 100
    const arr = (result.arrCents || 0) / 100
    const profit = (result.netProfitCents || 0) / 100
    const churn = result.churnRate ? (result.churnRate * 100).toFixed(1) : '—'

    let text = `📊 *MRR atual: R$ ${mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`
    text += `Clientes ativos: ${result.activeClients || 0}\n`
    text += `ARR: R$ ${arr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    text += `Churn: ${churn}%\n`
    text += `Lucro líquido: R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`

    if (result.momTrend?.mrr) {
      const change = result.momTrend.mrr.changePercent
      const arrow = change >= 0 ? '↑' : '↓'
      text += `Tendência MRR: ${arrow} ${Math.abs(change).toFixed(1)}% MoM\n`
    }

    text += `\n💡 *Sugestões:*\n/dre ${this.currentMonth()} | /caixa 30 | /gastos ${this.currentMonth()}`

    return text
  }

  private static formatDreSummary(result: any): string {
    const revenue = (result.revenueCents || 0) / 100
    const expenses = (result.expensesCents || 0) / 100
    const profit = (result.profitCents || 0) / 100

    let text = `📊 *DRE ${result.period}*\n`
    text += `Receitas: R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    text += `Despesas: R$ ${expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    text += `Resultado: R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`

    if (result.topGroups && result.topGroups.length > 0) {
      text += `\n*Top grupos:*\n`
      for (const group of result.topGroups) {
        const value = (group.totalCents || 0) / 100
        text += `• ${group.name}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
      }
    }

    text += `\n💡 *Sugestões:*\n/gastos ${result.period} | /caixa 30 | /mrr`

    return text
  }

  private static formatSpendByCategory(result: any): string {
    if (!result.rows || result.rows.length === 0) {
      return `📊 *Gastos por categoria*\nNenhum dado encontrado.\n\n💡 *Sugestões:*\n/dre ${this.currentMonth()} | /caixa 30`
    }

    let text = `📊 *Gastos por categoria*\n`
    const top5 = result.rows.slice(0, 5)
    for (const row of top5) {
      const value = (row.amountCents || 0) / 100
      text += `• ${row.categoryName || 'Sem categoria'}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    }

    text += `\n💡 *Sugestões:*\n/dre ${this.currentMonth()} | /caixa 30 | /mrr`

    return text
  }

  private static formatCashflowSummary(result: any): string {
    const current = (result.currentBalanceCents || 0) / 100
    const min = (result.minBalanceCents || 0) / 100
    const max = (result.maxBalanceCents || 0) / 100

    let text = `💰 *Fluxo de caixa (${result.projectionDays} dias)*\n`
    text += `Saldo atual: R$ ${current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    text += `Mínimo projetado: R$ ${min.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    text += `Máximo projetado: R$ ${max.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`

    if (result.criticalDays && result.criticalDays.length > 0) {
      text += `\n*Dias críticos:*\n`
      for (const day of result.criticalDays) {
        const balance = (day.balanceCents || 0) / 100
        const date = new Date(day.date).toLocaleDateString('pt-BR')
        text += `• ${date}: R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
      }
    }

    if (min < 0) {
      text += `\n⚠️ *Atenção:* Saldo negativo projetado!\n`
    }

    text += `\n💡 *Sugestões:*\n/dre ${this.currentMonth()} | /gastos ${this.currentMonth()} | /mrr`

    return text
  }

  private static formatNotifications(result: any): string {
    if (!result || result.length === 0) {
      return `🔔 *Notificações*\nNenhuma notificação nova.\n\n💡 *Sugestões:*\n/mrr | /dre ${this.currentMonth()}`
    }

    let text = `🔔 *Notificações (${result.length})*\n`
    const top5 = result.slice(0, 5)
    for (const notif of top5) {
      text += `• ${notif.title}\n`
      if (notif.body) {
        text += `  ${notif.body.substring(0, 50)}${notif.body.length > 50 ? '...' : ''}\n`
      }
    }

    text += `\n💡 *Sugestões:*\n/mrr | /dre ${this.currentMonth()} | /caixa 30`

    return text
  }

  private static formatCreateTransaction(result: any): string {
    const amount = (result.amountCents || 0) / 100
    const type = result.type === 'IN' ? 'Entrada' : 'Saída'

    return `✅ *Transação criada*\n${type}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n${result.description || ''}\n\n💡 *Sugestões:*\n/mrr | /dre ${this.currentMonth()} | /gastos ${this.currentMonth()}`
  }

  private static formatGeneric(result: any): string {
    return `✅ *Concluído*\n\n💡 *Sugestões:*\n/mrr | /dre ${this.currentMonth()} | /ajuda`
  }

  /**
   * Formata mensagem de confirmação
   */
  static formatConfirmation(toolName: string, toolInput: any): string {
    switch (toolName) {
      case 'createTransaction': {
        const amount = (toolInput.amountCents || 0) / 100
        const type = toolInput.type === 'IN' ? 'Entrada' : 'Saída'
        const date = toolInput.date || 'hoje'
        return `⚠️ *Confirmar transação?*\n\n${type}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nDescrição: ${toolInput.description || ''}\nData: ${date}\n\n*Confirmar?* (SIM / NÃO)`
      }
      default:
        return `⚠️ *Confirmar ação?*\n\nTool: ${toolName}\n\n*Confirmar?* (SIM / NÃO)`
    }
  }

  /**
   * Formata ajuda
   */
  static formatHelp(): string {
    return `📖 *Comandos disponíveis:*\n\n*/mrr* - MRR e métricas de crescimento\n*/dre [YYYY-MM]* - DRE do mês\n*/gastos [YYYY-MM]* - Gastos por categoria\n*/caixa [dias]* - Fluxo de caixa projetado\n*/lancar* - Criar transação\n*/notifs* - Ver notificações\n*/confirmar* - Confirmar ação pendente\n*/cancelar* - Cancelar ação pendente\n*/ajuda* - Esta mensagem\n\n💡 Use comandos ou escreva naturalmente!`
  }

  private static currentMonth(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
}





