import { Worker } from 'bullmq'
import { getDatabase } from '../../db/client'
import { ensureDatabaseReady } from '../../db/init'
import { findProductsByBrand } from '../../db/repositories/productsRepo'
import {
  markScrapeRunFailed,
  markScrapeRunRunning,
  markScrapeRunSuccess,
} from '../../db/repositories/scrapeRunsRepo'
import { SCRAPE_QUEUE_NAME } from '../constants'
import { getRedisConnectionOptions } from '../redis'
import type { ScrapeBrandJobData } from '../types'

function nowIso() {
  return new Date().toISOString()
}

async function processJob(data: ScrapeBrandJobData) {
  await ensureDatabaseReady()
  const db = getDatabase()

  markScrapeRunRunning(db, {
    id: data.runId,
    startedAt: nowIso(),
  })

  try {
    // Checkpoint 3 worker behavior:
    // validate queue and run lifecycle with a deterministic, DB-based count.
    const itemsFound = findProductsByBrand(db, data.brandId).length

    markScrapeRunSuccess(db, {
      id: data.runId,
      finishedAt: nowIso(),
      itemsFound,
    })

    return {
      runId: data.runId,
      brandId: data.brandId,
      itemsFound,
    }
  } catch (error) {
    markScrapeRunFailed(db, {
      id: data.runId,
      finishedAt: nowIso(),
      errorMessage: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

const worker = new Worker<ScrapeBrandJobData>(
  SCRAPE_QUEUE_NAME,
  async (job) => processJob(job.data),
  {
    connection: getRedisConnectionOptions(),
    concurrency: 2,
  },
)

worker.on('ready', () => {
  console.log('[scrape-worker] ready')
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
