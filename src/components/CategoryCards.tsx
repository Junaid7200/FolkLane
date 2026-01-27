import { Link } from '@tanstack/react-router'

const categories = [
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium brands for elegant occasions',
    tone: 'from-amber-50 via-amber-100 to-amber-200 border-amber-200/70',
    image: '/brands/mtf/mtf-3.jpg',
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Everyday comfort meets style',
    tone: 'from-slate-50 via-blue-50 to-slate-100 border-slate-200/70',
    image: '/brands/jindjan/jindjan-5.jpg',
  },
  {
    id: 'cheap',
    name: 'Affordable',
    description: 'Budget-friendly fashion finds',
    tone: 'from-stone-50 via-emerald-50 to-stone-100 border-stone-200/70',
    image: '/brands/mirakk/mirakk-4.jpg',
  },
]

export default function CategoryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {categories.map((category) => (
        <Link
          key={category.id}
          to="/category/$category"
          params = {{ category: category.id }}
          className="group"
        >
          <div
            className={`relative overflow-hidden bg-gradient-to-br ${category.tone} rounded-2xl p-6 sm:p-8 text-white shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 h-48 sm:h-56 md:h-64 flex flex-col justify-center items-center text-center border`}
          >
            <div
              className="absolute inset-0 bg-cover bg-top"
              style={{ backgroundImage: `url(${category.image})` }}
            />
            <div className="absolute inset-0 bg-slate-900/55" />
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">{category.name}</h3>
              <p className="text-base sm:text-lg text-slate-100">{category.description}</p>
            </div>
            <div className="relative z-10 mt-6 text-sm font-semibold text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore →
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
