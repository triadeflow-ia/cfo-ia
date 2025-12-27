/**
 * Automation repository - Data access layer
 */

import { prisma } from '@/shared/db'

export const automationRepo = {
  // ---------- Rules ----------
  async listRules(orgId: string, includeInactive = false) {
    return prisma.categorizationRule.findMany({
      where: {
        orgId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ isActive: 'desc' }, { priority: 'asc' }],
      include: {
        vendor: true,
        account: true,
        category: true,
        costCenter: true,
        client: true,
      },
    })
  },

  async listActiveRules(orgId: string) {
    return prisma.categorizationRule.findMany({
      where: { orgId, isActive: true },
      orderBy: { priority: 'asc' },
    })
  },

  async createRule(orgId: string, data: any) {
    return prisma.categorizationRule.create({
      data: { orgId, ...data },
      include: {
        vendor: true,
        account: true,
        category: true,
        costCenter: true,
        client: true,
      },
    })
  },

  async updateRule(orgId: string, id: string, data: any) {
    const existing = await prisma.categorizationRule.findFirst({
      where: { id, orgId },
    })
    if (!existing) throw new Error('Rule not found')

    return prisma.categorizationRule.update({
      where: { id },
      data,
      include: {
        vendor: true,
        account: true,
        category: true,
        costCenter: true,
        client: true,
      },
    })
  },

  async deleteRule(orgId: string, id: string) {
    const existing = await prisma.categorizationRule.findFirst({
      where: { id, orgId },
    })
    if (!existing) throw new Error('Rule not found')

    return prisma.categorizationRule.delete({ where: { id } })
  },

  // ---------- Recurrences ----------
  async listRecurrences(orgId: string, includeInactive = false) {
    return prisma.recurrence.findMany({
      where: {
        orgId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { nextRunAt: 'asc' },
      include: {
        account: true,
        category: true,
        costCenter: true,
        client: true,
        vendor: true,
      },
    })
  },

  async listDueRecurrences(orgId: string, now: Date) {
    return prisma.recurrence.findMany({
      where: { orgId, isActive: true, nextRunAt: { lte: now } },
      orderBy: { nextRunAt: 'asc' },
    })
  },

  async createRecurrence(orgId: string, data: any) {
    return prisma.recurrence.create({
      data: { orgId, ...data },
      include: {
        account: true,
        category: true,
        costCenter: true,
        client: true,
        vendor: true,
      },
    })
  },

  async updateRecurrence(orgId: string, id: string, data: any) {
    const existing = await prisma.recurrence.findFirst({
      where: { id, orgId },
    })
    if (!existing) throw new Error('Recurrence not found')

    return prisma.recurrence.update({
      where: { id },
      data,
      include: {
        account: true,
        category: true,
        costCenter: true,
        client: true,
        vendor: true,
      },
    })
  },

  async deleteRecurrence(orgId: string, id: string) {
    const existing = await prisma.recurrence.findFirst({
      where: { id, orgId },
    })
    if (!existing) throw new Error('Recurrence not found')

    return prisma.recurrence.delete({ where: { id } })
  },

  // ---------- Notifications ----------
  async listNotifications(orgId: string, unreadOnly = false, limit = 50) {
    return prisma.notification.findMany({
      where: {
        orgId,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  },

  async markAsRead(orgId: string, id: string) {
    const existing = await prisma.notification.findFirst({
      where: { id, orgId },
    })
    if (!existing) throw new Error('Notification not found')

    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    })
  },

  async markAllAsRead(orgId: string) {
    return prisma.notification.updateMany({
      where: { orgId, readAt: null },
      data: { readAt: new Date() },
    })
  },

  async createNotifications(
    orgId: string,
    items: Array<{
      type: string
      severity: string
      title: string
      body: string
      metadata?: any
    }>
  ) {
    if (items.length === 0) return { count: 0 }
    return prisma.notification.createMany({
      data: items.map((i: any) => ({ orgId, ...i })),
    })
  },
}




