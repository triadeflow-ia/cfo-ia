/**
 * Integration Service - Orchestrates sync and match operations
 */

import { syncBankTransactions } from './bank-sync.service'
import { generateMatchSuggestions } from './match-engine.service'
import { logger } from '@/shared/logger'

interface SyncBankResult {
  imported: number
  skipped: number
  errors: number
  matches: {
    autoMatched: number
    suggested: number
    unmatched: number
  }
}

/**
 * Sync bank transactions and run match engine
 */
export async function syncBankAndMatch(options: {
  orgId: string
  connectionId: string
  from?: Date
  to?: Date
}): Promise<SyncBankResult> {
  const { orgId, connectionId, from, to } = options

  // 1. Sync transactions
  const syncResult = await syncBankTransactions({
    orgId,
    connectionId,
    from,
    to,
  })

  // 2. Run match engine
  const matchResult = await generateMatchSuggestions(orgId)

  logger.info('Bank sync and match completed', {
    orgId,
    connectionId,
    syncResult,
    matchResult,
  })

  return {
    ...syncResult,
    matches: {
      autoMatched: matchResult.autoMatched,
      suggested: matchResult.generated,
      unmatched: syncResult.imported - matchResult.autoMatched - matchResult.generated,
    },
  }
}



