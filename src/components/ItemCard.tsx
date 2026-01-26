import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import ImagePlaceholder from './ImagePlaceholder'

type ItemCardProps = {
  id: string
  title: string
  price: number
  image: string
  brand: string
  category: string
}

export default function ItemCard({ id, title, price, image, brand, category }: ItemCardProps) {
  // Check if image is placeholder path - if so, show placeholder immediately without trying to load
  const isPlaceholderPath = image === '/placeholder.jpg' || !image
  const [imageError, setImageError] = useState(isPlaceholderPath)

  return (
    <Link
      to="/category/$category/brand/$brand/item/$itemid"
      params= {{ category: category, brand: brand, itemid: id }}
      className="group block"
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all overflow-hidden transform hover:-translate-y-1">
        {/* Image */}
        <div className="aspect-square bg-gray-200 overflow-hidden relative">
          {!imageError ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <ImagePlaceholder className="w-full h-full" />
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {title}
          </h3>
          <p className="text-2xl font-bold text-amber-600">
            Rs. {price.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  )
}
