import { createFileRoute } from '@tanstack/react-router'
import { hasBrand, listBrandProducts } from '@/server/api/catalogApi'

export const Route = createFileRoute('/api/brands/$brandId/products')({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ params }) => {
        const brandExists = await hasBrand(params.brandId)

        if (!brandExists) {
          return Response.json(
            { error: `Brand not found: ${params.brandId}` },
            { status: 404 },
          )
        }

        const products = await listBrandProducts(params.brandId)
        return Response.json(products)
      },
    },
  },
})
