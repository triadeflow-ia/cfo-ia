/**
 * BullMQ queue for automation jobs
 */

import { Queue } from 'bullmq'
import { redis } from '@/shared/redis'

export const automationQueue = new Queue('automation', {
  connection: redis,
})





