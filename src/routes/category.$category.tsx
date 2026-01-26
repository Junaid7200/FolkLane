import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/category/$category')({
  component: RouteComponent,
})

function RouteComponent() {
  const { category } = Route.useParams()
  return <div>
    <p>
      Hello "/category/{category}"!
    </p>
    <Outlet />
      </div>
}
