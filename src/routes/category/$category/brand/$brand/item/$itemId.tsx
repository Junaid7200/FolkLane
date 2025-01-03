import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/category/$category/brand/$brand/item/$itemId',
)({
  component: ItemPage,
})

function ItemPage() {
  const { category, brand, itemId } = Route.useParams()
  return (
    <div>
      item route: {itemId} (brand: {brand}, category: {category})
    </div>
  )
}
