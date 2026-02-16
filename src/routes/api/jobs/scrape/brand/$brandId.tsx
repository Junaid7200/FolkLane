import { randomUUID } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import { hasBrand } from '@/server/api/catalogApi'
import { getDatabase } from '@/server/db/client'
import { ensureDatabaseReady } from '@/server/db/init'
import {
  createQueuedScrapeRun,
  markScrapeRunFailed,
} from '@/server/db/repositories/scrapeRunsRepo'
import { enqueueScrapeBrandJob } from '@/server/queue/jobs/scrapeBrand.job'

export const Route = createFileRoute('/api/jobs/scrape/brand/$brandId')({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ params }) => {
        if (params.brandId !== 'jindjan') {
          return Response.json(
            {
              error: `Scraper not implemented for brand: ${params.brandId}`,
              supportedBrands: ['jindjan'],
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
        createQueuedScrapeRun(db, { id: runId, brandId: params.brandId })

        try {
          const job = await enqueueScrapeBrandJob({
            runId,
            brandId: params.brandId,
            triggeredBy: 'manual',
          })

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
