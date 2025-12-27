/**
 * AI Provider Domain Types
 */

export type Decision =
  | { kind: 'tool'; toolName: string; toolInput: any; confidence?: number; reason?: string }
  | { kind: 'help' }
  | { kind: 'unknown' }

export interface MessageContext {
  conversationId: string
  userId: string
  orgId: string
  recentMessages: Array<{
    direction: 'IN' | 'OUT'
    text: string
    createdAt: Date
  }>
}

export interface AIProvider {
  /**
   * Decide qual ação tomar baseado na mensagem e contexto
   */
  decide(message: string, context: MessageContext): Promise<Decision>
}





