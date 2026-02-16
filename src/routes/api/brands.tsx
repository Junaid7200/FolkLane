import { createFileRoute } from '@tanstack/react-router'
import { listBrands } from '@/server/api/catalogApi'

export const Route = createFileRoute('/api/brands')({
  component: () => null,
  server: {
    handlers: {
      GET: async () => {
        const brands = await listBrands()
        return Response.json(brands)
      },
    },
  },
})

