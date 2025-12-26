/**
 * Worker para processar notificações proativas via WhatsApp
 * Roda periodicamente (cron: a cada 5-10 minutos)
 */

import { prisma } from '@/shared/db'
import { processNotificationsForOrg } from '@/modules/whatsapp/application/notification-sender'
import { logger } from '@/shared/logger'

/**
 * Processa notificações para todas as organizações
 */
export async function processProactiveNotifications() {
  logger.info('Starting proactive notifications worker')

  const orgs = await prisma.organization.findMany({
    where: {
      whatsappSettings: {
        isNot: null, // Apenas orgs com settings configurados
      },
    },
    include: {
      whatsappSettings: true,
    },
  })

  let totalSent = 0
  let totalSkipped = 0
  let totalFailed = 0

  for (const org of orgs) {
    try {
      const result = await processNotificationsForOrg(org.id)
      totalSent += result.sent
      totalSkipped += result.skipped
      totalFailed += result.failed

      if (result.sent > 0 || result.failed > 0) {
        logger.info('Processed notifications for org', {
          orgId: org.id,
          sent: result.sent,
          skipped: result.skipped,
          failed: result.failed,
        })
      }
    } catch (error: any) {
      logger.error('Error processing notifications for org', {
        orgId: org.id,
        error: error.message,
      })
      totalFailed++
    }
  }

  logger.info('Proactive notifications worker completed', {
    totalSent,
    totalSkipped,
    totalFailed,
    orgsProcessed: orgs.length,
  })
}

// Se executado diretamente (para testes)
if (require.main === module) {
  processProactiveNotifications()
    .then(() => {
      logger.info('Worker finished')
      process.exit(0)
    })
    .catch(error => {
      logger.error('Worker failed', { error: error.message })
      process.exit(1)
    })
}



