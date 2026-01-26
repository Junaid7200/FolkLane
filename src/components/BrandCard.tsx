import { Link } from '@tanstack/react-router'

type BrandCardProps = {
  id: string
  name: string
  category: string
  description?: string
}

export default function BrandCard({ id, name, category, description }: BrandCardProps) {
  return (
    <Link
      to={`/category/${category}/brand/${id}`}
      className="group block"
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all overflow-hidden transform hover:-translate-y-2 h-full">
        {/* Brand Logo/Icon Area */}
        <div className="h-48 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <h3 className="text-4xl font-bold text-white">{name}</h3>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
            {name}
          </h3>
          {description && (
            <p className="text-gray-600 mb-4">{description}</p>
          )}
          <div className="text-amber-600 font-semibold group-hover:underline">
            View Collection →
          </div>
        </div>
      </div>
    </Link>
  )
}
