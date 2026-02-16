import { SCRAPE_BRAND_JOB_NAME } from '../constants'
import { getScrapeQueue } from '../queues'
import type { ScrapeBrandJobData } from '../types'

export async function enqueueScrapeBrandJob(data: ScrapeBrandJobData) {
  const queue = getScrapeQueue()
  const job = await queue.add(SCRAPE_BRAND_JOB_NAME, data, {
    jobId: data.runId,
  })

  return {
    id: String(job.id),
    name: job.name,
  }
}

