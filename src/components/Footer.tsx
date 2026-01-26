import { Link } from '@tanstack/react-router'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-amber-400">FolkLane</h3>
            <p className="text-gray-300">
              Your destination for authentic Pakistani clothing and jewelry brands.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-amber-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/category/luxury" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Luxury
                </Link>
              </li>
              <li>
                <Link to="/category/casual" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Casual
                </Link>
              </li>
              <li>
                <Link to="/category/cheap" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Affordable
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 FolkLane. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
