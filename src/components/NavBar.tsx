import { Link } from '@tanstack/react-router'
import { useState } from 'react'

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-bold tracking-wide hover:text-amber-400 transition-colors"
          >
            FolkLane
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-amber-400 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              to="/"
              className="text-lg font-medium hover:text-amber-400 transition-colors"
              activeProps={{ className: 'text-amber-400' }}
            >
              Home
            </Link>
            <Link
              to="/category/$category"
              params={{ category: 'luxury' }}
              className="text-lg font-medium hover:text-amber-400 transition-colors"
            >
              Luxury
            </Link>
            <Link
              to="/category/$category"
              params={{ category: 'casual' }}
              className="text-lg font-medium hover:text-amber-400 transition-colors"
            >
              Casual
            </Link>
            <Link
              to="/category/$category"
              params={{ category: 'cheap' }}
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
