import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/category/$category/brand/$brand')({
  component: BrandPage,
})

function BrandPage() {
  const { category, brand } = Route.useParams()
  return (
    <div>
      brand route: {brand} (category: {category})
    </div>
  )
}
