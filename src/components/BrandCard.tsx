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
      to="/category/$category/brand/$brand"
      params= {{ category: category, brand: id }}
      className="group block"
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden transform hover:-translate-y-1 h-full border border-slate-200">
        {/* Brand Logo/Icon Area */}
        <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 px-4 text-center">{name}</h3>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
            {name}
          </h3>
          {description && (
            <p className="text-gray-600 mb-4">{description}</p>
          )}
          <div className="text-amber-700 font-semibold group-hover:underline">
            View Collection →
          </div>
        </div>
      </div>
    </Link>
  )
}
