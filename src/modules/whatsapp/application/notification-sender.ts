/**
 * Notification Sender - Envia notificações proativas via WhatsApp
 */

import { prisma } from '@/shared/db'
import { whatsappRepo } from '../infra/whatsapp.repo'
import { sendWhatsAppMessage } from '../infra/whatsapp-sender'
import { logger } from '@/shared/logger'

interface NotificationWithDelivery extends any {
  delivery?: any
}

/**
 * Verifica se está na janela de silêncio
 */
function isQuietHours(settings: any): boolean {
  if (!settings?.quietHoursStart || !settings?.quietHoursEnd) {
    return false
  }

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeMinutes = currentHour * 60 + currentMinute

  const [startHour, startMin] = settings.quietHoursStart.split(':').map(Number)
  const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number)
  const startTimeMinutes = startHour * 60 + startMin
  const endTimeMinutes = endHour * 60 + endMin

  // Se horário cruza meia-noite (ex: 22:00 - 07:00)
  if (startTimeMinutes > endTimeMinutes) {
    return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes < endTimeMinutes
  }

  return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes
}

/**
 * Formata mensagem de notificação
 */
function formatNotificationMessage(notif: any): string {
  const title = notif.title || 'Notificação'
  const body = notif.body || ''

  if (notif.severity === 'CRITICAL') {
    return `🚨 *${title}*\n\n${body}\n\n💡 *Sugestões:*\n/notifs | /dre ${new Date().toISOString().slice(0, 7)} | /caixa 30`
  }

  return `⚠️ *${title}*\n\n${body}\n\n💡 *Sugestões:*\n/notifs | /dre ${new Date().toISOString().slice(0, 7)} | /caixa 30`
}

/**
 * Formata digest diário
 */
function formatDailyDigest(notifications: any[]): string {
  const critical = notifications.filter(n => n.severity === 'CRITICAL').length
  const warnings = notifications.filter(n => n.severity === 'WARNING').length
  const info = notifications.filter(n => n.severity === 'INFO').length

  let text = `📌 *Resumo do dia*\n\n`
  
  if (critical > 0) {
    text += `${critical} alerta${critical > 1 ? 's' : ''} crítico${critical > 1 ? 's' : ''}\n`
  }
  if (warnings > 0) {
    text += `${warnings} aviso${warnings > 1 ? 's' : ''}\n`
  }
  if (info > 0) {
    text += `${info} informação${info > 1 ? 'ões' : ''}\n`
  }

  // Resumir algumas notificações
  const top3 = notifications.slice(0, 3)
  if (top3.length > 0) {
    text += `\n*Principais:*\n`
    for (const notif of top3) {
      text += `• ${notif.title}\n`
    }
  }

  text += `\n💡 *Sugestões:*\n/notifs | /dre ${new Date().toISOString().slice(0, 7)} | /gastos ${new Date().toISOString().slice(0, 7)}`

  return text
}

/**
 * Envia notificação individual
 */
async function sendNotification(
  orgId: string,
  userId: string,
  notification: any,
  phoneE164: string
): Promise<boolean> {
  try {
    // Buscar ou criar conversa
    let conversation = await whatsappRepo.findOrCreateConversation(orgId, userId, 'WHATSAPP')

    const messageText = formatNotificationMessage(notification)

    await sendWhatsAppMessage({
      to: phoneE164,
      text: messageText,
      orgId,
      conversationId: conversation.id,
    })

    // Marcar como enviada
    await prisma.notificationDelivery.upsert({
      where: {
        notificationId_userId_channel: {
          notificationId: notification.id,
          userId,
          channel: 'WHATSAPP',
        },
      },
      create: {
        orgId,
        notificationId: notification.id,
        userId,
        channel: 'WHATSAPP',
        status: 'SENT',
        sentAt: new Date(),
      },
      update: {
        status: 'SENT',
        sentAt: new Date(),
      },
    })

    return true
  } catch (error: any) {
    logger.error('Failed to send notification', {
      notificationId: notification.id,
      userId,
      error: error.message,
    })

    // Marcar como falhou
    await prisma.notificationDelivery.upsert({
      where: {
        notificationId_userId_channel: {
          notificationId: notification.id,
          userId,
          channel: 'WHATSAPP',
        },
      },
      create: {
        orgId,
        notificationId: notification.id,
        userId,
        channel: 'WHATSAPP',
        status: 'FAILED',
        error: error.message,
      },
      update: {
        status: 'FAILED',
        error: error.message,
      },
    })

    return false
  }
}

/**
 * Processa notificações pendentes para uma org
 */
export async function processNotificationsForOrg(orgId: string): Promise<{ sent: number; skipped: number; failed: number }> {
  const settings = await prisma.whatsappSettings.findUnique({
    where: { orgId },
  })

  // Buscar notificações não enviadas das últimas 24h
  const last24h = new Date()
  last24h.setHours(last24h.getHours() - 24)

  const notifications = await prisma.notification.findMany({
    where: {
      orgId,
      createdAt: { gte: last24h },
      deliveries: {
        none: {
          channel: 'WHATSAPP',
          status: 'SENT',
        },
      },
    },
    include: {
      deliveries: {
        where: {
          channel: 'WHATSAPP',
        },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (notifications.length === 0) {
    return { sent: 0, skipped: 0, failed: 0 }
  }

  // Verificar janela de silêncio
  const inQuietHours = isQuietHours(settings)

  // Separar críticas (sempre enviam) e normais
  const critical = notifications.filter(n => n.severity === 'CRITICAL')
  const normal = notifications.filter(n => n.severity !== 'CRITICAL')

  let sent = 0
  let skipped = 0
  let failed = 0

  // Buscar usuários com WhatsApp vinculado
  const userLinks = await prisma.whatsappUserLink.findMany({
    where: {
      orgId,
      isActive: true,
    },
    include: {
      user: true,
    },
  })

  for (const link of userLinks) {
    // Críticas sempre enviam (fura quiet hours)
    for (const notif of critical) {
      const result = await sendNotification(orgId, link.userId, notif, link.phoneE164)
      if (result) sent++
      else failed++
    }

    // Normais respeitam quiet hours e agregação diária
    if (inQuietHours && normal.length > 0) {
      skipped += normal.length
      continue
    }

    // Se tem digest diário configurado, agregar
    if (settings?.dailyDigestTime) {
      const now = new Date()
      const digestTime = settings.dailyDigestTime.split(':')
      const digestHour = parseInt(digestTime[0], 10)
      const digestMin = parseInt(digestTime[1], 10)

      // Se está no horário do digest, enviar resumo
      if (now.getHours() === digestHour && now.getMinutes() >= digestMin && now.getMinutes() < digestMin + 5) {
        const digestText = formatDailyDigest(normal)
        try {
          let conversation = await whatsappRepo.findOrCreateConversation(orgId, link.userId, 'WHATSAPP')
          await sendWhatsAppMessage({
            to: link.phoneE164,
            text: digestText,
            orgId,
            conversationId: conversation.id,
          })
          sent++

          // Marcar todas como enviadas (via digest)
          for (const notif of normal) {
            await prisma.notificationDelivery.upsert({
              where: {
                notificationId_userId_channel: {
                  notificationId: notif.id,
                  userId: link.userId,
                  channel: 'WHATSAPP',
                },
              },
              create: {
                orgId,
                notificationId: notif.id,
                userId: link.userId,
                channel: 'WHATSAPP',
                status: 'SENT',
                sentAt: new Date(),
              },
              update: {
                status: 'SENT',
                sentAt: new Date(),
              },
            })
          }
        } catch (error: any) {
          logger.error('Failed to send daily digest', { error: error.message })
          failed++
        }
      } else {
        skipped += normal.length
      }
    } else {
      // Enviar individualmente
      for (const notif of normal) {
        const result = await sendNotification(orgId, link.userId, notif, link.phoneE164)
        if (result) sent++
        else failed++
      }
    }
  }

  return { sent, skipped, failed }
}



