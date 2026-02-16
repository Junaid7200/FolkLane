import { createServerFn } from '@tanstack/react-start'
import { serverConfig } from '../config/env'
import { getDatabaseClientState } from '../db/client'
import { ensureDatabaseReady } from '../db/init'
import { isQueueReady } from '../queue/health'

export type BackendHealth = {
  status: 'ok'
  timestamp: string
  service: string
  environment: string
  database: {
    provider: 'sqlite'
    file: string
    ready: boolean
  }
  queue: {
    provider: 'bullmq'
    redisUrl: string
    ready: boolean
  }
}

export const getBackendHealth = createServerFn({
  method: 'GET',
}).handler(async (): Promise<BackendHealth> => {
  await ensureDatabaseReady()
  const queueReady = await isQueueReady()
  const db = getDatabaseClientState()

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'folklane-backend',
    environment: serverConfig.nodeEnv,
    database: {
      provider: db.provider,
      file: db.file,
      ready: db.ready,
    },
    queue: {
      provider: 'bullmq',
      redisUrl: serverConfig.redisUrl,
      ready: queueReady,
    },
  }
})
