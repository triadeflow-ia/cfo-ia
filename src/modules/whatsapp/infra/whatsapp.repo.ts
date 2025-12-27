/**
 * WhatsApp Repository - Data access layer for WhatsApp operations
 */

import { prisma } from '@/shared/db'

export const whatsappRepo = {
  async listLinks(orgId: string) {
    return prisma.whatsappUserLink.findMany({
      where: { orgId },
    })
  },

  async findLinkByPhone(orgId: string, phoneE164: string) {
    return prisma.whatsappUserLink.findFirst({
      where: { orgId, phoneE164 },
    })
  },

  async findLinkByUserId(orgId: string, userId: string) {
    return prisma.whatsappUserLink.findFirst({
      where: { orgId, userId },
    })
  },

  async createLink(orgId: string, data: { userId: string; phoneE164: string }) {
    return prisma.whatsappUserLink.create({
      data: { orgId, ...data },
    })
  },

  async updateLink(orgId: string, id: string, data: any) {
    return prisma.whatsappUserLink.update({
      where: { id },
      data,
    })
  },

  async deleteLink(orgId: string, id: string) {
    return prisma.whatsappUserLink.delete({
      where: { id },
    })
  },

  async getConversation(orgId: string, conversationId: string) {
    return prisma.conversation.findFirst({
      where: { id: conversationId, orgId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  },

  async listConversations(orgId: string, filters: any) {
    return prisma.conversation.findMany({
      where: { orgId, ...filters },
      orderBy: { updatedAt: 'desc' },
    })
  },

  async findOrCreateConversation(orgId: string, userId: string, channel: 'WHATSAPP') {
    let conversation = await prisma.conversation.findFirst({
      where: { orgId, userId, channel },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { orgId, userId, channel, status: 'OPEN' },
      })
    }

    return conversation
  },

  async createMessage(orgId: string, data: {
    conversationId: string
    direction: 'IN' | 'OUT'
    content: string
    messageId?: string
  }) {
    return prisma.conversationMessage.create({
      data: {
        orgId,
        conversationId: data.conversationId,
        direction: data.direction,
        text: data.content, // Schema uses 'text' field
        messageId: data.messageId || '',
      },
    })
  },

  async createPendingAction(orgId: string, data: {
    userId: string
    conversationId: string
    toolName: string
    toolInput: any
    expiresAt: Date
  }) {
    return prisma.pendingAction.create({
      data: { orgId, ...data },
    })
  },

  async listPendingActionsByConversation(orgId: string, conversationId: string) {
    return prisma.pendingAction.findMany({
      where: { orgId, conversationId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findPendingAction(orgId: string, actionId: string) {
    return prisma.pendingAction.findFirst({
      where: { id: actionId, orgId },
    })
  },

  async deletePendingAction(orgId: string, actionId: string) {
    // Verify ownership before deleting
    const existing = await prisma.pendingAction.findFirst({
      where: { id: actionId, orgId },
    })
    if (!existing) {
      throw new Error('Pending action not found')
    }
    return prisma.pendingAction.delete({
      where: { id: actionId },
    })
  },

  async listExpiredPendingActions(orgId?: string) {
    const where: any = {
      expiresAt: { lt: new Date() },
    }
    if (orgId) {
      where.orgId = orgId
    }
    return prisma.pendingAction.findMany({
      where,
    })
  },
}
