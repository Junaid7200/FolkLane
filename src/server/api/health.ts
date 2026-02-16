import { createServerFn } from '@tanstack/react-start'
import { serverConfig } from '../config/env'
import { getDatabaseClientState } from '../db/client'

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
    ready: false
  }
}

export const getBackendHealth = createServerFn({
  method: 'GET',
}).handler(async (): Promise<BackendHealth> => {
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
      ready: false,
    },
  }
})

