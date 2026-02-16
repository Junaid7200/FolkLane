import type { ConnectionOptions } from 'bullmq'
import { serverConfig } from '../config/env'

export function getRedisConnectionOptions(): ConnectionOptions {
  const url = new URL(serverConfig.redisUrl)
  const dbValue = url.pathname.replace('/', '')
  const db = dbValue ? Number.parseInt(dbValue, 10) : undefined

  return {
    host: url.hostname,
    port: url.port ? Number.parseInt(url.port, 10) : 6379,
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number.isNaN(db) ? undefined : db,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
}
