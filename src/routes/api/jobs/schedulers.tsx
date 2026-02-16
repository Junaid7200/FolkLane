import { createFileRoute } from '@tanstack/react-router'
import {
  listScrapeSchedulers,
  registerScrapeSchedulers,
} from '@/server/queue/scheduler/scrapeScheduler'

export const Route = createFileRoute('/api/jobs/schedulers')({
  component: () => null,
  server: {
    handlers: {
      GET: async () => {
        try {
          const schedulers = await listScrapeSchedulers()
          return Response.json({ schedulers })
        } catch (error) {
          return Response.json(
            {
              error: 'Unable to list schedulers',
              details: error instanceof Error ? error.message : String(error),
            },
            { status: 503 },
          )
        }
      },
      POST: async () => {
        try {
          const registered = await registerScrapeSchedulers()
          return Response.json({ registered }, { status: 201 })
        } catch (error) {
          return Response.json(
            {
              error: 'Unable to register schedulers',
              details: error instanceof Error ? error.message : String(error),
            },
            { status: 503 },
          )
        }
      },
    },
  },
})

