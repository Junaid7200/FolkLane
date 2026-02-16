import path from 'node:path'
import { createServerFn } from '@tanstack/react-start'
import { serverConfig } from '../config/env'
import { isQueueReady } from '../queue/health'
import { listScrapeSchedulers } from '../queue/scheduler/scrapeScheduler'

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
    schedulePattern: string
    schedulerCount: number | null
  }
}

export const getBackendHealth = createServerFn({
  method: 'GET',
}).handler(async (): Promise<BackendHealth> => {
  let databaseState: BackendHealth['database'] = {
    provider: 'sqlite',
    file: path.resolve(process.cwd(), serverConfig.sqliteFile),
    ready: false,
  }

  try {
    const [{ ensureDatabaseReady }, { getDatabaseClientState }] =
      await Promise.all([import('../db/init'), import('../db/client')])
    await ensureDatabaseReady()
    const db = getDatabaseClientState()
    databaseState = {
      provider: db.provider,
      file: db.file,
      ready: db.ready,
    }
  } catch {
    // Keep degraded DB health instead of failing request.
  }

  const queueReady = await isQueueReady()
  let schedulerCount: number | null = null
  if (queueReady) {
    try {
      schedulerCount = (await listScrapeSchedulers()).length
    } catch {
      schedulerCount = null
    }
  }

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'folklane-backend',
    environment: serverConfig.nodeEnv,
    database: databaseState,
    queue: {
      provider: 'bullmq',
      redisUrl: serverConfig.redisUrl,
      ready: queueReady,
      schedulePattern: serverConfig.scrapeSchedulePattern,
      schedulerCount,
    },
  }
})
