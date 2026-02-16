import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

type Slide = {
  id: number
  image: string
  eyebrow: string
  title: string
  description: string
  category: 'luxury' | 'casual' | 'cheap'
  cta: string
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/brands/cosset/cosset-1.jpg',
    eyebrow: 'Luxury Edit',
    title: 'Statement Looks for Celebrations',
    description:
      'Discover premium festive silhouettes, couture details, and timeless pieces for special occasions.',
    category: 'luxury',
    cta: 'Explore Luxury Brands',
  },
  {
    id: 2,
    image: '/brands/sobia-nazir/sobia-4.jpg',
    eyebrow: 'Daily Elegance',
    title: 'Everyday Style, Refined',
    description:
      'Shop breathable fabrics and versatile outfits built for comfort, confidence, and modern routines.',
    category: 'casual',
    cta: 'Shop Casual Collections',
  },
  {
    id: 3,
    image: '/brands/saima/saima-4.jpg',
    eyebrow: 'Value Picks',
    title: 'Fashion That Fits Your Budget',
    description:
      'Find affordable staples with great style for daily wear without compromising on quality.',
    category: 'cheap',
    cta: 'Browse Affordable Finds',
  },
]

export default function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5500)

    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="relative h-96 sm:h-108 md:h-120 bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-900/55 to-slate-950/35" />
          <div className="relative h-full container mx-auto px-6 sm:px-10 flex items-center">
            <div className="max-w-xl text-white">
              <p className="uppercase tracking-[0.2em] text-xs sm:text-sm text-amber-300 font-semibold mb-3">
                {slide.eyebrow}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                {slide.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-100/95 mb-6">
                {slide.description}
              </p>
              <Link
                to="/category/$category"
                params={{ category: slide.category }}
                className="inline-flex items-center justify-center bg-white text-slate-900 px-6 sm:px-7 py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-slate-200 transition-colors"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center">
        <button
          type="button"
          onClick={prevSlide}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
          aria-label="Previous slide"
        >
          ‹
        </button>
      </div>
      <div className="absolute inset-y-0 right-3 sm:right-4 flex items-center">
        <button
          type="button"
          onClick={nextSlide}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
          aria-label="Next slide"
        >
          ›
        </button>
      </div>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-7 sm:w-8'
                : 'bg-white/55 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
