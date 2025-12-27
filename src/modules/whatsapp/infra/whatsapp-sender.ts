/**
 * WhatsApp Sender - Envio de mensagens via Cloud API
 */

import { logger } from '@/shared/logger'
import { whatsappRepo } from './whatsapp.repo'
import crypto from 'crypto'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v20.0'
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

interface SendMessageOptions {
  to: string // E.164 format
  text: string
  orgId: string
  conversationId: string
}

/**
 * Envia mensagem via WhatsApp Cloud API com retry/backoff
 */
export async function sendWhatsAppMessage(options: SendMessageOptions): Promise<string | null> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    logger.error('WhatsApp credentials not configured')
    throw new Error('WhatsApp credentials not configured')
  }

  const { to, text, orgId, conversationId } = options

  const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {
      body: text,
    },
  }

  // Retry com backoff exponencial
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`WhatsApp API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      const messageId = data.messages?.[0]?.id

      if (!messageId) {
        throw new Error('No message ID returned from WhatsApp API')
      }

      // Salvar mensagem de saída no banco (idempotente)
      try {
        await whatsappRepo.createMessage(orgId, {
          conversationId,
          direction: 'OUT',
          messageId,
          content: text,
        })
      } catch (error: any) {
        // Ignora erro de duplicata (idempotência)
        if (error.code !== 'P2002') {
          logger.error('Error saving outbound message', { error: error.message })
        }
      }

      logger.info('WhatsApp message sent', { to, messageId, attempt: attempt + 1 })
      return messageId
    } catch (error: any) {
      lastError = error
      logger.warn('WhatsApp send attempt failed', {
        attempt: attempt + 1,
        error: error.message,
        to,
      })

      // Backoff exponencial: 1s, 2s, 4s
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  logger.error('WhatsApp send failed after retries', {
    to,
    error: lastError?.message,
  })
  throw lastError || new Error('Failed to send WhatsApp message')
}

/**
 * Gera hash de conteúdo para deduplicação opcional
 */
export function hashMessageContent(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16)
}





