import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/category_/$category/brand/$brand')({
  component: RouteComponent,
})

function RouteComponent() {
  const { category, brand } = Route.useParams()
  return <div>Hello "/category/{category}/brand/{brand}"!</div>
}
