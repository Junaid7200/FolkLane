import { randomUUID } from 'node:crypto'
import { Worker } from 'bullmq'
import { serverConfig } from '../../config/env'
import { getDatabase } from '../../db/client'
import { ensureDatabaseReady } from '../../db/init'
import {
  createQueuedScrapeRun,
  markScrapeRunFailed,
  markScrapeRunRunning,
  markScrapeRunSuccess,
  setScrapeRunQueueJobId,
} from '../../db/repositories/scrapeRunsRepo'
import { runBrandScrape } from '../../scrapers/orchestrator/runBrandScrape'
import { SCRAPE_QUEUE_NAME } from '../constants'
import { getRedisConnectionOptions } from '../redis'
import { registerScrapeSchedulers } from '../scheduler/scrapeScheduler'
import type { ScrapeBrandJobData } from '../types'

function nowIso() {
  return new Date().toISOString()
}

function safePositiveInt(value: number, fallback: number) {
  if (!Number.isFinite(value) || value <= 0) return fallback
  return Math.floor(value)
}

function resolveRunId(data: ScrapeBrandJobData) {
  return data.runId && data.runId.length > 0 ? data.runId : randomUUID()
}

async function processJob(job: {
  id?: string | number | null
  data: ScrapeBrandJobData
  attemptsMade: number
  opts: { attempts?: number }
}) {
  const data = job.data
  await ensureDatabaseReady()
  const db = getDatabase()
  const runId = resolveRunId(data)
  const maxAttempts = safePositiveInt(job.opts.attempts ?? 1, 1)
  const attempts = safePositiveInt(job.attemptsMade + 1, 1)

  if (!data.runId) {
    createQueuedScrapeRun(db, {
      id: runId,
      brandId: data.brandId,
      triggeredBy: data.triggeredBy,
      queueJobId: job.id ? String(job.id) : null,
      maxAttempts,
    })
  } else if (job.id) {
    setScrapeRunQueueJobId(db, { id: runId, queueJobId: String(job.id) })
  }

  markScrapeRunRunning(db, {
    id: runId,
    startedAt: nowIso(),
    attempts,
  })

  try {
    const scrapeResult = await runBrandScrape(data.brandId, {
      maxProducts: safePositiveInt(serverConfig.scrapeMaxProducts, 100),
      maxPages: safePositiveInt(serverConfig.scrapeMaxPages, 20),
    })
    const itemsFound = scrapeResult.storedCount

    markScrapeRunSuccess(db, {
      id: runId,
      finishedAt: nowIso(),
      itemsFound,
    })

    return {
      runId,
      brandId: data.brandId,
      itemsFound,
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    const retryHint =
      attempts < maxAttempts
        ? ` (attempt ${attempts}/${maxAttempts}; retry scheduled)`
        : ` (attempt ${attempts}/${maxAttempts}; final failure)`

    markScrapeRunFailed(db, {
      id: runId,
      finishedAt: nowIso(),
      attempts,
      errorMessage: `${detail}${retryHint}`,
    })
    throw error
  }
}

const worker = new Worker<ScrapeBrandJobData>(
  SCRAPE_QUEUE_NAME,
  async (job) => processJob(job),
  {
    connection: getRedisConnectionOptions(),
    concurrency: 2,
  },
)

worker.on('ready', () => {
  console.log('[scrape-worker] ready')
  void registerScrapeSchedulers()
    .then((schedulers) => {
      const summary = schedulers
        .map((item) => `${item.brandId}:${item.pattern}`)
        .join(', ')
      console.log(`[scrape-worker] schedulers registered -> ${summary}`)
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[scrape-worker] scheduler registration failed: ${message}`)
    })
})

worker.on('completed', (job) => {
  console.log(`[scrape-worker] completed job=${job.id}`)
})

worker.on('failed', (job, err) => {
  console.error(
    `[scrape-worker] failed job=${job?.id ?? 'unknown'} error=${err.message}`,
  )
})

async function shutdown(signal: string) {
  console.log(`[scrape-worker] received ${signal}, shutting down`)
  await worker.close()
  process.exit(0)
}

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})
process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})
