import { Link } from '@tanstack/react-router'

const categories = [
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium brands for elegant occasions',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Everyday comfort meets style',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'cheap',
    name: 'Affordable',
    description: 'Budget-friendly fashion finds',
    color: 'from-green-500 to-emerald-500',
  },
]

export default function CategoryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          className="group"
        >
          <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 h-64 flex flex-col justify-center items-center text-center`}>
            <h3 className="text-3xl font-bold mb-3">{category.name}</h3>
            <p className="text-lg opacity-90">{category.description}</p>
            <div className="mt-6 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Explore →
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
