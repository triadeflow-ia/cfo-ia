/**
 * Worker process for automation jobs (BullMQ)
 * Run with: npm run worker
 */

import { Worker } from 'bullmq'
import { redis } from './shared/redis'
import { recurrenceService } from './modules/automation/application/recurrence.service'
import { alertsService } from './modules/automation/application/alerts.service'
import { logger } from './shared/logger'

const worker = new Worker(
  'automation',
  async (job) => {
    const { orgId } = job.data as { orgId: string }

    logger.info(`Processing job: ${job.name}`, { orgId, jobId: job.id })

    try {
      if (job.name === 'runRecurrences') {
        const result = await recurrenceService.runDue(orgId)
        logger.info('Recurrences processed', { orgId, result })
        return result
      }

      if (job.name === 'runAlerts') {
        const result = await alertsService.runDaily(orgId)
        logger.info('Alerts processed', { orgId, result })
        return result
      }

      logger.warn('Unknown job name', { jobName: job.name })
      return { ok: true, message: 'Unknown job' }
    } catch (error) {
      logger.error('Job failed', error as Error, { orgId, jobName: job.name })
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
)

worker.on('completed', (job) => {
  logger.info('Job completed', { jobId: job.id, jobName: job.name })
})

worker.on('failed', (job, err) => {
  logger.error('Job failed', err, { jobId: job?.id, jobName: job?.name })
})

logger.info('Automation worker started')

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker...')
  await worker.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing worker...')
  await worker.close()
  process.exit(0)
})



