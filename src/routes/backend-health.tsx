import { createFileRoute } from '@tanstack/react-router'
import { getBackendHealth } from '@/server/api/health'

export const Route = createFileRoute('/backend-health')({
  loader: async () => {
    return getBackendHealth()
  },
  component: BackendHealthPage,
})

function BackendHealthPage() {
  const health = Route.useLoaderData()

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
        Backend Health (Checkpoint 0)
      </h1>
      <p className="text-gray-600 mb-6">
        This page verifies server wiring for backend modules before DB/queue
        implementation.
      </p>
      <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm">
        {JSON.stringify(health, null, 2)}
      </pre>
    </div>
  )
}

