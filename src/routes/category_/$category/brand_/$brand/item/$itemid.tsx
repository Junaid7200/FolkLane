import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/category_/$category/brand_/$brand/item/$itemid',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/category_/$category/brand_/$brand/item/$itemid"!</div>
}
