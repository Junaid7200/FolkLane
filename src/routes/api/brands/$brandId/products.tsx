import { createFileRoute } from '@tanstack/react-router'
import { listBrands, listBrandProducts } from '@/server/api/catalogApi'

export const Route = createFileRoute('/api/brands/$brandId/products')({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ params }) => {
        const brands = await listBrands()
        const brandExists = brands.some((brand) => brand.id === params.brandId)

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

