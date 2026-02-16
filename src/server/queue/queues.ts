import { Queue } from 'bullmq'
import { SCRAPE_QUEUE_NAME } from './constants'
import { getRedisConnectionOptions } from './redis'
import type { ScrapeBrandJobData } from './types'

let scrapeQueue: Queue<ScrapeBrandJobData> | null = null

export function getScrapeQueue(): Queue<ScrapeBrandJobData> {
  if (scrapeQueue) return scrapeQueue

  scrapeQueue = new Queue<ScrapeBrandJobData>(SCRAPE_QUEUE_NAME, {
    connection: getRedisConnectionOptions(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        count: 200,
      },
      removeOnFail: {
        count: 500,
      },
    },
  })

  return scrapeQueue
}

