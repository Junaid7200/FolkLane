import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/category/$category')({
  component: CategoryPage,
})

function CategoryPage() {
  const { category } = Route.useParams()
  return <div>category route: {category}</div>
}
