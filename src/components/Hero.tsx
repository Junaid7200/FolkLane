import { Link } from '@tanstack/react-router'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-20">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
          Discover Pakistan's
          <span className="block text-amber-600 mt-2">Finest Fashion</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto">
          Explore curated collections from luxury to affordable Pakistani clothing and jewelry brands
        </p>
        <Link
          to="/category/$category"
          params= {{ category: 'luxury' }}
          className="inline-block bg-amber-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Browse Collections
        </Link>
      </div>
    </section>
  )
}
