import { useState } from 'react'
import ImagePlaceholder from './ImagePlaceholder'

type ItemDetailProps = {
  title: string
  price: number
  description: string
  image: string
  brand: string
}

export default function ItemDetail({ title, price, description, image, brand }: ItemDetailProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Image */}
        <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden relative">
          {!imageError ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <ImagePlaceholder className="w-full h-full" />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <div className="text-sm text-amber-600 font-semibold mb-2 uppercase tracking-wide">
            {brand}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-6 sm:mb-8">
            Rs. {price.toLocaleString()}
          </div>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8">
            {description}
          </p>
          <button className="cursor-pointer bg-amber-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl w-full sm:w-fit text-center">
            This button doesn't do anything yet
          </button>
        </div>
      </div>
    </div>
  )
}
