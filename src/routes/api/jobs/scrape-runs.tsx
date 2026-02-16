import { createFileRoute } from '@tanstack/react-router'
import { getDatabase } from '@/server/db/client'
import { ensureDatabaseReady } from '@/server/db/init'
import { listRecentScrapeRuns } from '@/server/db/repositories/scrapeRunsRepo'

function getLimitFromRequest(request: Request) {
  const limitParam = new URL(request.url).searchParams.get('limit')
  if (!limitParam) return 20
  const parsed = Number.parseInt(limitParam, 10)
  if (Number.isNaN(parsed)) return 20
  return Math.min(Math.max(parsed, 1), 100)
}

export const Route = createFileRoute('/api/jobs/scrape-runs')({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ request }) => {
        await ensureDatabaseReady()
        const db = getDatabase()
        const limit = getLimitFromRequest(request)
        const runs = listRecentScrapeRuns(db, limit)
        return Response.json(runs)
      },
    },
  },
})

