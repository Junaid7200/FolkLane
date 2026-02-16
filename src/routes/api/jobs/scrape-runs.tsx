import { createFileRoute } from '@tanstack/react-router'
import { getDatabase } from '@/server/db/client'
import { ensureDatabaseReady } from '@/server/db/init'
import { listRecentScrapeRuns } from '@/server/db/repositories/scrapeRunsRepo'
import type { ScrapeRunStatus } from '@/server/db/schema'

function getLimitFromRequest(request: Request) {
  const limitParam = new URL(request.url).searchParams.get('limit')
  if (!limitParam) return 20
  const parsed = Number.parseInt(limitParam, 10)
  if (Number.isNaN(parsed)) return 20
  return Math.min(Math.max(parsed, 1), 100)
}

function getStatusFromRequest(request: Request): ScrapeRunStatus | null {
  const status = new URL(request.url).searchParams.get('status')
  if (!status) return null
  if (
    status === 'queued' ||
    status === 'running' ||
    status === 'success' ||
    status === 'failed'
  ) {
    return status
  }
  return null
}

function getBrandFromRequest(request: Request): string | null {
  const brand = new URL(request.url).searchParams.get('brandId')
  return brand && brand.length > 0 ? brand : null
}

export const Route = createFileRoute('/api/jobs/scrape-runs')({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ request }) => {
        await ensureDatabaseReady()
        const db = getDatabase()
        const limit = getLimitFromRequest(request)
        const status = getStatusFromRequest(request)
        const brandId = getBrandFromRequest(request)
        const runs = listRecentScrapeRuns(db, {
          limit,
          status: status ?? undefined,
          brandId: brandId ?? undefined,
        })
        return Response.json(runs)
      },
    },
  },
})
