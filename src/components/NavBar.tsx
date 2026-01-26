import { Link } from '@tanstack/react-router'

export default function NavBar() {
  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo/Brand */}
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-bold tracking-wide hover:text-amber-400 transition-colors self-center md:self-auto"
          >
            FolkLane
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-8 text-base md:text-lg">
            <Link
              to="/"
              className="font-medium hover:text-amber-400 transition-colors"
              activeProps={{ className: 'text-amber-400' }}
            >
              Home
            </Link>
            <Link
              to="/category/$category"
              params={{ category: 'luxury' }}
              className="font-medium hover:text-amber-400 transition-colors"
            >
              Luxury
            </Link>
            <Link
              to="/category/$category"
              params={{ category: 'casual' }}
              className="font-medium hover:text-amber-400 transition-colors"
            >
              Casual
            </Link>
            <Link
              to="/category/$category"
              params={{ category: 'cheap' }}
              className="font-medium hover:text-amber-400 transition-colors"
            >
              Affordable
            </Link>
            <Link
              to="/about"
              className="font-medium hover:text-amber-400 transition-colors"
              activeProps={{ className: 'text-amber-400' }}
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
