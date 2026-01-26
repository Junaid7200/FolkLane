import { Link } from '@tanstack/react-router'

export default function NavBar() {
  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="text-3xl font-bold tracking-wide hover:text-amber-400 transition-colors">
            FolkLane
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-lg font-medium hover:text-amber-400 transition-colors"
              activeProps={{ className: 'text-amber-400' }}
            >
              Home
            </Link>
            <Link
              to="/category/luxury"
              className="text-lg font-medium hover:text-amber-400 transition-colors"
            >
              Luxury
            </Link>
            <Link
              to="/category/casual"
              className="text-lg font-medium hover:text-amber-400 transition-colors"
            >
              Casual
            </Link>
            <Link
              to="/category/cheap"
              className="text-lg font-medium hover:text-amber-400 transition-colors"
            >
              Affordable
            </Link>
            <Link
              to="/about"
              className="text-lg font-medium hover:text-amber-400 transition-colors"
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
