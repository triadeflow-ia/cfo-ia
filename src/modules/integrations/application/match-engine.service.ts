/**
 * Match Engine Service - Reconcilia BankTransactions com Transactions
 */

import { integrationRepo } from '../infra/repositories/integration.repo'
import { ledgerRepo } from '@/modules/ledger/infra/ledger.repo'
import { logger } from '@/shared/logger'

interface MatchScore {
  score: number
  reason: {
    amountMatch: boolean
    dateMatch: boolean
    descriptionSimilarity: number
  }
}

/**
 * Calcula similaridade entre duas strings (Levenshtein simplificado)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  if (s1 === s2) return 1.0
  if (s1.includes(s2) || s2.includes(s1)) return 0.8

  // Similaridade simples baseada em palavras comuns
  const words1 = new Set(s1.split(/\s+/))
  const words2 = new Set(s2.split(/\s+/))
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return union.size > 0 ? intersection.size / union.size : 0
}

/**
 * Calcula score de match entre BankTransaction e Transaction
 */
function calculateMatchScore(
  bankTx: { amountCents: number; postedAt: Date; description: string },
  transaction: { amountCents: number; date: Date; description: string }
): MatchScore {
  let score = 0
  const reason: MatchScore['reason'] = {
    amountMatch: false,
    dateMatch: false,
    descriptionSimilarity: 0,
  }

  // Match de valor (40 pts)
  if (Math.abs(bankTx.amountCents) === Math.abs(transaction.amountCents)) {
    score += 40
    reason.amountMatch = true
  }

  // Match de data (30 pts) - até 2 dias de diferença
  const daysDiff = Math.abs(
    (bankTx.postedAt.getTime() - transaction.date.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysDiff <= 2) {
    score += 30 * (1 - daysDiff / 2) // Decai linearmente
    reason.dateMatch = true
  }

  // Similaridade de descrição (30 pts)
  const similarity = calculateSimilarity(bankTx.description, transaction.description)
  score += 30 * similarity
  reason.descriptionSimilarity = similarity

  return { score: Math.round(score), reason }
}

/**
 * Encontra matches para uma BankTransaction
 */
export async function findMatchesForBankTransaction(
  orgId: string,
  bankTransactionId: string
): Promise<Array<{ transactionId: string; score: number; reason: any }>> {
  const bankTx = await prisma.bankTransaction.findFirst({
    where: { id: bankTransactionId, orgId },
  })

  if (!bankTx) {
    throw new Error('Bank transaction not found')
  }

  // Buscar transações no período (30 dias antes e depois)
  const from = new Date(bankTx.postedAt)
  from.setDate(from.getDate() - 30)
  const to = new Date(bankTx.postedAt)
  to.setDate(to.getDate() + 30)

  const transactions = await ledgerRepo.listTransactions(orgId, {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    page: 1,
    pageSize: 100,
  })

  // Calcular scores
  const matches: Array<{ transactionId: string; score: number; reason: any }> = []

  for (const tx of transactions.items) {
      // Ignorar se já está matchado (tem externalId de outra integração)
      // Mas permitir matches com transações manuais

    const matchScore = calculateMatchScore(
      {
        amountCents: bankTx.amountCents,
        postedAt: bankTx.postedAt,
        description: bankTx.description,
      },
      {
        amountCents: tx.amountCents,
        date: tx.date,
        description: tx.description,
      }
    )

    if (matchScore.score >= 60) {
      // Só sugerir se score >= 60
      matches.push({
        transactionId: tx.id,
        score: matchScore.score,
        reason: matchScore.reason,
      })
    }
  }

  // Ordenar por score descendente
  matches.sort((a, b) => b.score - a.score)

  return matches.slice(0, 5) // Top 5 matches
}

/**
 * Gera sugestões de match para todas as BankTransactions não matchadas
 */
export async function generateMatchSuggestions(orgId: string): Promise<{
  generated: number
  autoMatched: number
}> {
  // Buscar BankTransactions não matchadas
  const unmatched = await integrationRepo.listBankTransactions(orgId, {
    matchStatus: 'UNMATCHED',
  })

  let generated = 0
  let autoMatched = 0

  for (const bankTx of unmatched) {
    try {
      const matches = await findMatchesForBankTransaction(orgId, bankTx.id)

      if (matches.length === 0) {
        continue
      }

      // Se score >= 85, auto-match
      const bestMatch = matches[0]
      if (bestMatch.score >= 85) {
        await integrationRepo.updateBankTransactionMatch(orgId, bankTx.id, bestMatch.transactionId)
        autoMatched++

        logger.info('Auto-matched bank transaction', {
          bankTransactionId: bankTx.id,
          transactionId: bestMatch.transactionId,
          score: bestMatch.score,
        })
      } else {
        // Criar sugestões para todas as matches com score >= 60
        for (const match of matches) {
          try {
            await integrationRepo.createMatchSuggestion(orgId, {
              bankTransactionId: bankTx.id,
              transactionId: match.transactionId,
              score: match.score,
              reason: match.reason,
            })
            generated++
          } catch (error: any) {
            // Ignora duplicatas
            if (error.code !== 'P2002') {
              logger.error('Error creating match suggestion', { error: error.message })
            }
          }
        }

        // Atualizar status para SUGGESTED
        await prisma.bankTransaction.update({
          where: { id: bankTx.id },
          data: { matchStatus: 'SUGGESTED' },
        })
      }
    } catch (error: any) {
      logger.error('Error generating matches for bank transaction', {
        error: error.message,
        bankTransactionId: bankTx.id,
      })
    }
  }

  return { generated, autoMatched }
}

/**
 * Aprova uma sugestão de match
 */
export async function approveMatch(
  orgId: string,
  matchSuggestionId: string
): Promise<void> {
  const suggestion = await prisma.matchSuggestion.findFirst({
    where: { id: matchSuggestionId, orgId },
    include: {
      bankTransaction: true,
    },
  })

  if (!suggestion) {
    throw new Error('Match suggestion not found')
  }

  // Atualizar BankTransaction
  await integrationRepo.updateBankTransactionMatch(
    orgId,
    suggestion.bankTransactionId,
    suggestion.transactionId
  )

  // Deletar outras sugestões para a mesma BankTransaction
  await prisma.matchSuggestion.deleteMany({
    where: {
      bankTransactionId: suggestion.bankTransactionId,
      id: { not: suggestion.id },
    },
  })
}

/**
 * Rejeita uma sugestão de match
 */
export async function rejectMatch(orgId: string, matchSuggestionId: string): Promise<void> {
  await integrationRepo.deleteMatchSuggestion(matchSuggestionId)
}

/**
 * Cria Transaction a partir de BankTransaction
 */
export async function createTransactionFromBankTransaction(
  orgId: string,
  userId: string,
  bankTransactionId: string,
  accountId: string
): Promise<string> {
  const bankTx = await prisma.bankTransaction.findFirst({
    where: { id: bankTransactionId, orgId },
  })

  if (!bankTx) {
    throw new Error('Bank transaction not found')
  }

  // Criar Transaction
  const transaction = await ledgerRepo.createTransaction(orgId, {
    type: bankTx.amountCents >= 0 ? 'IN' : 'OUT',
    status: 'CLEARED',
    date: bankTx.postedAt,
    amountCents: Math.abs(bankTx.amountCents),
    description: bankTx.description,
    accountId,
    source: 'integration',
    externalId: bankTx.externalId,
    importHash: null, // Não usar importHash para bank transactions, usar externalId
  })

  // Atualizar match
  await integrationRepo.updateBankTransactionMatch(orgId, bankTransactionId, transaction.id)

  // Deletar sugestões
  await prisma.matchSuggestion.deleteMany({
    where: { bankTransactionId },
  })

  return transaction.id
}

