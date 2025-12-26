/**
 * WhatsApp service - Application layer
 */

import { whatsappRepo } from '../infra/whatsapp.repo'
import {
  CreateWhatsappUserLinkSchema,
  UpdateWhatsappUserLinkSchema,
} from '../domain/schemas'

export const whatsappService = {
  /**
   * WhatsappUserLink CRUD
   */
  async listLinks(orgId: string) {
    return whatsappRepo.listLinks(orgId)
  },

  async findLinkByPhone(orgId: string, phoneE164: string) {
    return whatsappRepo.findLinkByPhone(orgId, phoneE164)
  },

  async findLinkByUserId(orgId: string, userId: string) {
    return whatsappRepo.findLinkByUserId(orgId, userId)
  },

  async createLink(orgId: string, input: unknown) {
    const data = CreateWhatsappUserLinkSchema.parse(input)
    
    // Verificar se já existe link para esse telefone
    const existing = await whatsappRepo.findLinkByPhone(orgId, data.phoneE164)
    if (existing) {
      throw new Error('Número já está vinculado a outro usuário')
    }

    return whatsappRepo.createLink(orgId, data)
  },

  async updateLink(orgId: string, id: string, input: unknown) {
    const data = UpdateWhatsappUserLinkSchema.parse(input)
    return whatsappRepo.updateLink(orgId, id, data)
  },

  async deleteLink(orgId: string, id: string) {
    return whatsappRepo.deleteLink(orgId, id)
  },

  /**
   * Conversation management
   */
  async getConversation(orgId: string, conversationId: string) {
    return whatsappRepo.getConversation(orgId, conversationId)
  },

  async listConversations(orgId: string, filters?: { userId?: string; status?: string }) {
    return whatsappRepo.listConversations(orgId, filters)
  },
}



