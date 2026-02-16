import { randomUUID } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import { hasBrand } from '@/server/api/catalogApi'
import { getDatabase } from '@/server/db/client'
import { ensureDatabaseReady } from '@/server/db/init'
import {
  createQueuedScrapeRun,
  markScrapeRunFailed,
  setScrapeRunQueueJobId,
} from '@/server/db/repositories/scrapeRunsRepo'
import { enqueueScrapeBrandJob } from '@/server/queue/jobs/scrapeBrand.job'

const MAX_RETRY_ATTEMPTS = 3
const SUPPORTED_MANUAL_SCRAPE_BRANDS = [
  'jindjan',
  'd-m-collection',
  'maria-nasir',
  'mirakk',
  'mtf',
  'cosset',
  'sobia-nazir',
  'uigc-collection',
] as const
type SupportedManualScrapeBrand = (typeof SUPPORTED_MANUAL_SCRAPE_BRANDS)[number]

function isSupportedManualScrapeBrand(
  brandId: string,
): brandId is SupportedManualScrapeBrand {
  return SUPPORTED_MANUAL_SCRAPE_BRANDS.includes(
    brandId as SupportedManualScrapeBrand,
  )
}

export const Route = createFileRoute('/api/jobs/scrape/brand/$brandId')({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ params }) => {
        if (!isSupportedManualScrapeBrand(params.brandId)) {
          return Response.json(
            {
              error: `Scraper not implemented for brand: ${params.brandId}`,
              supportedBrands: SUPPORTED_MANUAL_SCRAPE_BRANDS,
            },
            { status: 409 },
          )
        }

        const brandExists = await hasBrand(params.brandId)
        if (!brandExists) {
          return Response.json(
            { error: `Brand not found: ${params.brandId}` },
            { status: 404 },
          )
        }

        await ensureDatabaseReady()
        const db = getDatabase()

        const runId = randomUUID()
        createQueuedScrapeRun(db, {
          id: runId,
          brandId: params.brandId,
          triggeredBy: 'manual',
          queueJobId: null,
          maxAttempts: MAX_RETRY_ATTEMPTS,
        })

        try {
          const job = await enqueueScrapeBrandJob({
            runId,
            brandId: params.brandId,
            triggeredBy: 'manual',
          })
          setScrapeRunQueueJobId(db, { id: runId, queueJobId: job.id })

          return Response.json(
            {
              status: 'queued',
              runId,
              brandId: params.brandId,
              queueJobId: job.id,
            },
            { status: 202 },
          )
        } catch (error) {
          markScrapeRunFailed(db, {
            id: runId,
            finishedAt: new Date().toISOString(),
            attempts: 1,
            errorMessage:
              error instanceof Error ? error.message : 'Failed to enqueue job',
          })

          return Response.json(
            {
              error: 'Queue unavailable. Ensure Redis is running.',
              details: error instanceof Error ? error.message : String(error),
            },
            { status: 503 },
          )
        }
      },
    },
  },
})
