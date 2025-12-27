/**
 * Categorization service - Auto-categorization logic
 */

import { automationRepo } from '../infra/automation.repo'
import { prisma } from '@/shared/db'
import { createAuditLog } from '@/shared/utils/audit'

function matches(rule: any, tx: any): boolean {
  // Condições opcionais
  if (rule.vendorId && rule.vendorId !== tx.vendorId) return false
  if (rule.accountId && rule.accountId !== tx.accountId) return false
  if (rule.appliesTo && rule.appliesTo !== tx.type) return false

  const text = (tx.description ?? '').toLowerCase()
  const pattern = (rule.pattern ?? '').toLowerCase()

  switch (rule.matchType) {
    case 'CONTAINS':
      return text.includes(pattern)
    case 'STARTS_WITH':
      return text.startsWith(pattern)
    case 'ENDS_WITH':
      return text.endsWith(pattern)
    case 'REGEX':
      try {
        return new RegExp(rule.pattern, 'i').test(tx.description ?? '')
      } catch {
        return false
      }
    default:
      return false
  }
}

export const categorizationService = {
  async autoCategorize(orgId: string, transactionId: string, userId?: string) {
    const tx = await prisma.transaction.findFirst({
      where: { id: transactionId, orgId },
    })
    if (!tx) return { applied: false }

    // Não sobrescrever se já categorizado manualmente (MVP: se já tem categoryId, não mexe)
    const rules = await automationRepo.listActiveRules(orgId)
    const rule = rules.find((r) => matches(r, tx))

    if (!rule) return { applied: false }

    const patch: any = {}
    if (!tx.categoryId && rule.categoryId) patch.categoryId = rule.categoryId
    if (!tx.costCenterId && rule.costCenterId) patch.costCenterId = rule.costCenterId
    if (!tx.clientId && rule.clientId) patch.clientId = rule.clientId

    if (Object.keys(patch).length === 0) return { applied: false }

    await prisma.transaction.update({
      where: { id: tx.id },
      data: { ...patch },
    })

    // Audit log
    await createAuditLog({
      organizationId: orgId,
      action: 'update',
      entityType: 'Transaction',
      entityId: tx.id,
      changes: {
        old: {
          categoryId: tx.categoryId,
          costCenterId: tx.costCenterId,
          clientId: tx.clientId,
        },
        new: patch,
      },
      metadata: {
        source: 'api',
        ruleId: rule.id,
        ruleName: rule.name,
      },
      userId,
    })

    return { applied: true, ruleId: rule.id, patch }
  },

  async batchAutoCategorizeMissing(orgId: string, limit = 500) {
    const items = await prisma.transaction.findMany({
      where: { orgId, categoryId: null },
      orderBy: { date: 'desc' },
      take: limit,
    })

    let applied = 0
    for (const tx of items) {
      const res = await this.autoCategorize(orgId, tx.id)
      if (res.applied) applied++
    }
    return { scanned: items.length, applied }
  },
}




