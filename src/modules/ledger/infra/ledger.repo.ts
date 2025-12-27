/**
 * Ledger repository - Data access layer for ledger operations
 */

import { prisma } from '@/shared/db'

export const ledgerRepo = {
  async findClientByName(orgId: string, name: string) {
    return prisma.client.findFirst({
      where: { orgId, name: { contains: name, mode: 'insensitive' } },
    })
  },
  async createClient(orgId: string, data: any) {
    return prisma.client.create({
      data: { orgId, ...data },
    })
  },
  async updateClient(orgId: string, id: string, data: any) {
    return prisma.client.update({
      where: { id },
      data,
    })
  },
  async createTransaction(orgId: string, data: any) {
    return prisma.transaction.create({
      data: { orgId, ...data },
    })
  },
  async listClients(orgId: string) {
    return prisma.client.findMany({
      where: { orgId },
    })
  },
  async listTransactions(orgId: string, filters: any) {
    return prisma.transaction.findMany({
      where: { orgId, ...filters },
    })
  },
}
