/**
 * Intent Router - Parseia comandos e mensagens naturais
 */

import { tools } from '@/modules/whatsapp-tools'
import { extendedTools } from '@/modules/whatsapp-tools/tools-extended'

export interface ParsedIntent {
  tool: string
  input: any
  requiresConfirmation: boolean
}

/**
 * Router de intents - Slash commands + heurística
 */
export class IntentRouter {
  /**
   * Parse de comando ou mensagem natural
   */
  static parse(text: string): ParsedIntent | null {
    const trimmed = text.trim().toLowerCase()

    // Slash commands
    if (trimmed.startsWith('/')) {
      return this.parseSlashCommand(trimmed)
    }

    // Heurística para mensagens naturais
    return this.parseNaturalLanguage(trimmed)
  }

  /**
   * Parse de slash command
   */
  private static parseSlashCommand(text: string): ParsedIntent | null {
    const parts = text.split(/\s+/)
    const command = parts[0]
    const args = parts.slice(1)

    switch (command) {
      case '/ajuda':
      case '/help':
        return {
          tool: 'help',
          input: {},
          requiresConfirmation: false,
        }

      case '/mrr':
        return {
          tool: 'growthOverview',
          input: {},
          requiresConfirmation: false,
        }

      case '/dre': {
        const month = args[0] || this.currentMonth()
        return {
          tool: 'dreSummary',
          input: { month },
          requiresConfirmation: false,
        }
      }

      case '/gastos': {
        const month = args[0] || this.currentMonth()
        return {
          tool: 'spendByCategory',
          input: { month },
          requiresConfirmation: false,
        }
      }

      case '/caixa': {
        const days = parseInt(args[0] || '30', 10)
        return {
          tool: 'cashflowSummary',
          input: { projectionDays: days },
          requiresConfirmation: false,
        }
      }

      case '/lancar':
      case '/lançar': {
        // /lancar 1200 meta ads hoje conta:itau tipo:out
        const parsed = this.parseLancarCommand(args)
        if (!parsed.amountCents || !parsed.description) {
          throw new Error('Faltam dados: valor e descrição são obrigatórios')
        }
        return {
          tool: 'createTransaction',
          input: parsed,
          requiresConfirmation: true, // Sempre confirma escrita
        }
      }

      case '/notifs':
      case '/notificacoes':
        return {
          tool: 'listNotifications',
          input: { unreadOnly: true },
          requiresConfirmation: false,
        }

      case '/confirmar':
      case '/sim':
      case '/confirm':
      case '/yes':
        return {
          tool: 'confirmPendingAction',
          input: {},
          requiresConfirmation: false,
        }

      case '/cancelar':
      case '/nao':
      case '/não':
      case '/cancel':
      case '/no':
        return {
          tool: 'cancelPendingAction',
          input: {},
          requiresConfirmation: false,
        }

      default:
        return null
    }
  }

  /**
   * Parse de linguagem natural (heurística simples)
   */
  private static parseNaturalLanguage(text: string): ParsedIntent | null {
    // MRR
    if (text.match(/mrr|receita.*recorrente|mensal.*recorrente/i)) {
      return {
        tool: 'growthOverview',
        input: {},
        requiresConfirmation: false,
      }
    }

    // DRE
    if (text.match(/dre|resultado|demonstrativo|receita.*despesa/i)) {
      const monthMatch = text.match(/\d{4}-\d{2}/)
      const month = monthMatch ? monthMatch[0] : this.currentMonth()
      return {
        tool: 'dreSummary',
        input: { month },
        requiresConfirmation: false,
      }
    }

    // Gastos
    if (text.match(/gasto|despesa|saída.*categoria|categoria.*gasto/i)) {
      const monthMatch = text.match(/\d{4}-\d{2}/)
      const month = monthMatch ? monthMatch[0] : this.currentMonth()
      const [year, monthNum] = month.split('-').map(Number)
      const from = new Date(year, monthNum - 1, 1).toISOString().slice(0, 10)
      const to = new Date(year, monthNum, 0).toISOString().slice(0, 10)
      return {
        tool: 'spendByCategory',
        input: { from, to },
        requiresConfirmation: false,
      }
    }

    // Cashflow
    if (text.match(/caixa|fluxo.*caixa|projeção.*caixa/i)) {
      const daysMatch = text.match(/(\d+)\s*dias?/)
      const days = daysMatch ? parseInt(daysMatch[1], 10) : 30
      return {
        tool: 'cashflowSummary',
        input: { projectionDays: days },
        requiresConfirmation: false,
      }
    }

    // Criar transação
    const lancarMatch = text.match(/(?:lança|lançar|adiciona|adicionar|cadastra|cadastrar)\s+([\d.,]+)\s+(.+?)(?:\s+(?:hoje|ontem|amanhã|\d{4}-\d{2}-\d{2}))?/i)
    if (lancarMatch) {
      const amount = parseFloat(lancarMatch[1].replace(',', '.'))
      const description = lancarMatch[2].trim()
      // Heurística simples: se mencionar "receita" ou valores positivos, é IN
      const isOut = !text.match(/receita|entrada|pagamento.*receb/i)
      const dateMatch = text.match(/(hoje|ontem|amanhã|\d{4}-\d{2}-\d{2})/i)
      const date = dateMatch ? dateMatch[1] : 'hoje'

      return {
        tool: 'createTransaction',
        input: {
          amountCents: Math.round(amount * 100),
          description,
          type: isOut ? 'OUT' : 'IN',
          date: this.parseDate(date),
        },
        requiresConfirmation: true,
      }
    }

    // Notificações
    if (text.match(/notifica|alerta|lembrete/i)) {
      return {
        tool: 'listNotifications',
        input: { unreadOnly: true },
        requiresConfirmation: false,
      }
    }

    return null
  }

  /**
   * Parse de comando /lancar
   */
  private static parseLancarCommand(args: string[]): any {
    const result: any = {}

    // Primeiro argumento: valor
    if (args[0] && !isNaN(parseFloat(args[0].replace(',', '.')))) {
      result.amountCents = Math.round(parseFloat(args[0].replace(',', '.')) * 100)
    }

    // Descrição (tudo que não for keyword)
    const keywords = ['hoje', 'ontem', 'amanhã', 'conta:', 'tipo:', 'in', 'out']
    const descriptionParts: string[] = []
    let foundDate = false

    for (let i = 1; i < args.length; i++) {
      const arg = args[i].toLowerCase()
      
      if (arg === 'hoje' || arg === 'ontem' || arg === 'amanhã') {
        result.date = this.parseDate(arg)
        foundDate = true
      } else if (arg.startsWith('conta:')) {
        result.accountName = arg.replace('conta:', '').trim()
      } else if (arg.startsWith('tipo:')) {
        const type = arg.replace('tipo:', '').trim().toUpperCase()
        result.type = type === 'IN' ? 'IN' : 'OUT'
      } else if (arg.match(/^\d{4}-\d{2}-\d{2}$/)) {
        result.date = arg
        foundDate = true
      } else if (!keywords.includes(arg)) {
        descriptionParts.push(args[i])
      }
    }

    if (descriptionParts.length > 0) {
      result.description = descriptionParts.join(' ')
    }

    if (!foundDate) {
      result.date = this.currentDate()
    }

    if (!result.type) {
      result.type = 'OUT' // Default
    }

    return result
  }

  /**
   * Helper: mês atual (YYYY-MM)
   */
  private static currentMonth(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  /**
   * Helper: data atual (YYYY-MM-DD)
   */
  private static currentDate(): string {
    const now = new Date()
    return now.toISOString().slice(0, 10)
  }

  /**
   * Helper: parse de data relativa
   */
  private static parseDate(dateStr: string): string {
    const now = new Date()
    const date = dateStr.toLowerCase()

    if (date === 'hoje') {
      return now.toISOString().slice(0, 10)
    } else if (date === 'ontem') {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday.toISOString().slice(0, 10)
    } else if (date === 'amanhã' || date === 'amanha') {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().slice(0, 10)
    } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date
    }

    return now.toISOString().slice(0, 10)
  }
}

