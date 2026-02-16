import { serverConfig } from '../../config/env'
import { SCRAPE_BRAND_JOB_NAME } from '../constants'
import { getScrapeQueue } from '../queues'
import type { ScrapeBrandJobData } from '../types'

const SCHEDULED_BRANDS = ['jindjan'] as const

function schedulerIdForBrand(brandId: string) {
  return `schedule:scrape:${brandId}`
}

export async function registerScrapeSchedulers() {
  const queue = getScrapeQueue()
  const registrations: Array<{
    schedulerId: string
    brandId: string
    pattern: string
    nextJobId: string | undefined
  }> = []

  for (const brandId of SCHEDULED_BRANDS) {
    const schedulerId = schedulerIdForBrand(brandId)
    const nextJob = await queue.upsertJobScheduler(
      schedulerId,
      {
        pattern: serverConfig.scrapeSchedulePattern,
      },
      {
        name: SCRAPE_BRAND_JOB_NAME,
        data: {
          brandId,
          triggeredBy: 'schedule',
        } satisfies ScrapeBrandJobData,
        opts: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      },
    )

    registrations.push({
      schedulerId,
      brandId,
      pattern: serverConfig.scrapeSchedulePattern,
      nextJobId: nextJob.id ? String(nextJob.id) : undefined,
    })
  }

  return registrations
}

export async function listScrapeSchedulers() {
  const queue = getScrapeQueue()
  return queue.getJobSchedulers(0, 100, true)
}
