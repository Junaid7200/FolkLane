import { useEffect, useMemo, useState } from 'react'
import ImagePlaceholder from './ImagePlaceholder'
import { useCart } from '../context/CartContext'

type ItemDetailProps = {
  id: string
  title: string
  price: number
  description: string
  image: string
  images?: string[]
  brand: string
}

export default function ItemDetail({
  id,
  title,
  price,
  description,
  image,
  images,
  brand,
}: ItemDetailProps) {
  const { addItem } = useCart()
  const galleryImages = useMemo(() => {
    const candidates = images && images.length > 0 ? images : [image]
    const cleaned = candidates.filter((img): img is string => Boolean(img))
    const unique = Array.from(new Set(cleaned))
    return unique.length > 0 ? unique : ['/placeholder.jpg']
  }, [images, image])

  const [selectedImage, setSelectedImage] = useState(galleryImages[0])
  const [failedImages, setFailedImages] = useState<Record<string, true>>({})
  const [imageError, setImageError] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setSelectedImage(galleryImages[0])
    setFailedImages({})
  }, [id, galleryImages])

  const visibleImages = galleryImages.filter((img) => !failedImages[img])
  const activeImage = visibleImages.includes(selectedImage)
    ? selectedImage
    : visibleImages[0] || '/placeholder.jpg'
  const isPlaceholderPath = activeImage === '/placeholder.jpg' || !activeImage

  useEffect(() => {
    setImageError(isPlaceholderPath)
  }, [activeImage, isPlaceholderPath])

  const canAdd = price > 0 && id.length > 0

  const handleAddToCart = () => {
    if (!canAdd) return
    addItem({ id, title, price, image: activeImage, brand })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative">
            {!imageError ? (
              <img
                src={activeImage}
                alt={title}
                className="w-full h-full object-top object-cover"
                onError={() => {
                  setFailedImages((prev) => ({ ...prev, [activeImage]: true }))
                  setImageError(true)
                }}
              />
            ) : (
              <ImagePlaceholder className="w-full h-full" />
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
              {galleryImages
                .filter((img) => !failedImages[img])
                .map((thumb, index) => (
                  <button
                    key={`${thumb}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(thumb)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === thumb
                        ? 'border-slate-900'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={thumb}
                      alt={`${title} image ${index + 1}`}
                      className="w-full h-full object-cover object-top"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [thumb]: true }))
                      }
                    />
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="text-sm text-slate-600 font-semibold mb-2 uppercase tracking-wide">
            {brand}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">
            Rs. {price.toLocaleString()}
          </div>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8">
            {description}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className="cursor-pointer bg-slate-900 disabled:bg-slate-900/60 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl w-full sm:w-fit text-center disabled:cursor-not-allowed"
          >
            {added ? 'Added to cart' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
