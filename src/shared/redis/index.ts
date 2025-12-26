/**
 * Redis client singleton for BullMQ
 */

import Redis from 'ioredis'
import { logger } from '../logger'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

redis.on('error', (err) => {
  logger.error('Redis connection error', err)
})

redis.on('connect', () => {
  logger.info('Redis connected')
})



