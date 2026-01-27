import { Link } from '@tanstack/react-router'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-stone-100 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
          Pakistan’s Fashion,
          <span className="block text-slate-600 mt-2">All in One Place</span>
        </h1>
        <p className="text-base sm:text-lg md:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-3xl mx-auto">
Where Pakistani clothing brands come together digitally, offering customers diverse styles in one place.        </p>
        <Link
          to="/category/$category"
          params= {{ category: 'luxury' }}
          className="inline-block w-full sm:w-auto text-center bg-slate-900 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Browse Collections
        </Link>
      </div>
    </section>
  )
}
