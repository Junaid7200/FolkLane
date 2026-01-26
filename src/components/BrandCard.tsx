import { Link } from '@tanstack/react-router'

type BrandCardProps = {
  id: string
  name: string
  category: string
  description?: string
}

export default function BrandCard({ id, name, category, description }: BrandCardProps) {
  // Category-based gradient colors
  const gradientColors: Record<string, string> = {
    luxury: 'from-amber-400 to-orange-500',
    casual: 'from-blue-400 to-cyan-500',
    cheap: 'from-green-400 to-emerald-500',
  }

  const gradient = gradientColors[category] || 'from-gray-400 to-gray-500'

  return (
    <Link
      to="/category/$category/brand/$brand"
      params= {{ category: category, brand: id }}
      className="group block"
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all overflow-hidden transform hover:-translate-y-2 h-full">
        {/* Brand Logo/Icon Area */}
        <div className={`h-32 sm:h-40 md:h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white px-4 text-center">{name}</h3>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
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
