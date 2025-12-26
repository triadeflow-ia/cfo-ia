/**
 * PendingAction Service - Gerencia ações pendentes de confirmação
 */

import { whatsappRepo } from '../infra/whatsapp.repo'
import { logger } from '@/shared/logger'

export class PendingActionService {
  /**
   * Criar ação pendente
   */
  static async create(
    orgId: string,
    userId: string,
    conversationId: string,
    toolName: string,
    toolInput: any
  ): Promise<string> {
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10) // Expira em 10 minutos

    const action = await whatsappRepo.createPendingAction(orgId, {
      userId,
      conversationId,
      toolName,
      toolInput,
      expiresAt,
    })

    logger.info('PendingAction created', {
      actionId: action.id,
      toolName,
      userId,
      conversationId,
    })

    return action.id
  }

  /**
   * Buscar ação pendente válida
   */
  static async findValid(
    orgId: string,
    userId: string,
    conversationId: string
  ) {
    const actions = await whatsappRepo.listPendingActionsByConversation(orgId, conversationId)
    if (actions.length === 0) return null

    // Retornar a mais recente (já ordenada)
    const action = actions[0]

    // Verificar se pertence ao usuário correto
    if (action.userId !== userId) return null

    return action
  }

  /**
   * Confirmar e retornar dados da ação
   */
  static async confirm(orgId: string, actionId: string) {
    const action = await whatsappRepo.findPendingAction(orgId, actionId)
    if (!action) {
      throw new Error('Ação não encontrada ou expirada')
    }

    // Deletar action
    await whatsappRepo.deletePendingAction(orgId, actionId)

    logger.info('PendingAction confirmed', {
      actionId,
      toolName: action.toolName,
      userId: action.userId,
    })

    return {
      toolName: action.toolName,
      toolInput: action.toolInput as any,
      userId: action.userId,
      conversationId: action.conversationId,
    }
  }

  /**
   * Cancelar ação
   */
  static async cancel(orgId: string, actionId: string) {
    const action = await whatsappRepo.findPendingAction(orgId, actionId)
    if (!action) {
      return // Já expirada ou não existe
    }

    await whatsappRepo.deletePendingAction(orgId, actionId)

    logger.info('PendingAction cancelled', {
      actionId,
      toolName: action.toolName,
      userId: action.userId,
    })
  }

  /**
   * Limpar ações expiradas (chamado periodicamente)
   */
  static async cleanupExpired(orgId?: string) {
    const expired = await whatsappRepo.listExpiredPendingActions(orgId)
    
    for (const action of expired) {
      await whatsappRepo.deletePendingAction(action.orgId, action.id)
    }

    if (expired.length > 0) {
      logger.info('Expired PendingActions cleaned up', { count: expired.length })
    }
  }
}

