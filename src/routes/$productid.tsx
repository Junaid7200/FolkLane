import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$productid')({
  component: RouteComponent,
})

function RouteComponent() {
  const { productid } = Route.useParams();
  return <div>Hello "/{productid} at a dynamic route"!</div>
}
