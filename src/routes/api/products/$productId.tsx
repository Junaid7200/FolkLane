import { createFileRoute } from '@tanstack/react-router'
import { getProduct } from '@/server/api/catalogApi'

export const Route = createFileRoute('/api/products/$productId')({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ params }) => {
        const product = await getProduct(params.productId)

        if (!product) {
          return Response.json(
            { error: `Product not found: ${params.productId}` },
            { status: 404 },
          )
        }

        return Response.json(product)
      },
    },
  },
})

