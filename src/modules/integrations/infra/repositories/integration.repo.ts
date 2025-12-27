/**
 * Integration repository - Data access layer for integrations
 */

import { prisma } from '@/shared/db'

export const integrationRepo = {
  async findConnection(orgId: string, id: string) {
    return prisma.integrationConnection.findFirst({
      where: { id, orgId },
    })
  },
  async updateConnection(orgId: string, id: string, data: any) {
    return prisma.integrationConnection.update({
      where: { id },
      data,
    })
  },
  async listBankTransactions(orgId: string, filters: any) {
    return prisma.bankTransaction.findMany({
      where: { orgId, ...filters },
    })
  },
  async updateBankTransactionMatch(orgId: string, id: string, transactionId: string) {
    return prisma.bankTransaction.update({
      where: { id },
      data: { matchedTransactionId: transactionId },
    })
  },
  async createMatchSuggestion(orgId: string, data: any) {
    return prisma.matchSuggestion.create({
      data: { orgId, ...data },
    })
  },
  async deleteMatchSuggestion(id: string) {
    return prisma.matchSuggestion.delete({
      where: { id },
    })
  },
}
