import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

type SlideBrand = {
  id: string
  name: string
}

type Slide = {
  id: number
  image: string
  eyebrow: string
  title: string
  description: string
  highlight: string
  category: 'luxury' | 'casual' | 'cheap'
  cta: string
  brands: Array<SlideBrand>
  accent: string
}

const slides: Array<Slide> = [
  {
    id: 1,
    image: '/brands/cosset/cosset-1.jpg',
    eyebrow: 'Luxury Edit',
    title: 'Wedding and Festive Luxury, Curated',
    description:
      'Explore premium silhouettes, intricate embroidery, and statement outfits built for events that matter.',
    highlight: 'Focused on premium formalwear and occasion dressing.',
    category: 'luxury',
    cta: 'Explore Luxury Brands',
    brands: [
      { id: 'mtf', name: 'MTF' },
      { id: 'maria-nasir', name: 'Maria Nasir' },
      { id: 'sobia-nazir', name: 'Sobia Nazir' },
    ],
    accent: 'from-amber-400/35 via-orange-300/10 to-transparent',
  },
  {
    id: 2,
    image: '/brands/sobia-nazir/sobia-4.jpg',
    eyebrow: 'Casual Rotation',
    title: 'Everyday Style, Refined',
    description:
      'Find breathable fabrics and versatile collections designed for workdays, outings, and repeat wear.',
    highlight: 'Balanced picks for comfort, quality, and easy styling.',
    category: 'casual',
    cta: 'Shop Casual Collections',
    brands: [
      { id: 'mtf', name: 'MTF' },
      { id: 'jindjan', name: 'Jindjan' },
      { id: 'saima', name: 'Saima Collection' },
      { id: 'd-m-collection', name: 'D&M Collection' },
      { id: 'khalid-rashid-fabrics', name: 'Khalid Rashid Fabrics' },
      { id: 'royal-garments', name: 'Royal Garments' },
      { id: 'uigc-collection', name: 'Urge' },
    ],
    accent: 'from-sky-400/35 via-cyan-300/10 to-transparent',
  },
  {
    id: 3,
    image: '/brands/saima/saima-4.jpg',
    eyebrow: 'Value Picks',
    title: 'Affordable Looks That Still Feel Fresh',
    description:
      'Browse budget-friendly options for daily use, seasonal updates, and practical wardrobe refreshes.',
    highlight: 'Great-value products without sacrificing usable style.',
    category: 'cheap',
    cta: 'Browse Affordable Finds',
    brands: [
      { id: 'cosset', name: 'Cosset' },
      { id: 'jindjan', name: 'Jindjan' },
      { id: 'saima', name: 'Saima Collection' },
      { id: 'mirakk', name: 'Mirakk' },
    ],
    accent: 'from-emerald-400/35 via-lime-300/10 to-transparent',
  },
]

export default function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5500)

    return () => clearInterval(timer)
  }, [isPaused])

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
    <div
      className="relative h-120 sm:h-128 md:h-136 bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800/50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide
              ? 'opacity-100 z-20 pointer-events-auto'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={index !== currentSlide}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-900/55 to-slate-950/35" />
          <div
            className={`pointer-events-none absolute inset-0 bg-linear-to-t ${slide.accent}`}
          />

          <div className="relative h-full px-6 sm:px-10 lg:px-12 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div className="max-w-xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 mb-4">
                <span className="uppercase tracking-[0.16em] text-[11px] sm:text-xs text-amber-200 font-semibold">
                  {slide.eyebrow}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                {slide.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-100/95 mb-4">
                {slide.description}
              </p>
              <p className="text-xs sm:text-sm text-slate-200/90 mb-6">
                {slide.highlight}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/category/$category"
                  params={{ category: slide.category }}
                  className="inline-flex items-center justify-center bg-white text-slate-900 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-slate-200 transition-colors"
                >
                  {slide.cta}
                </Link>
                <span className="text-xs sm:text-sm text-slate-200/85">
                  {slide.brands.length} featured brands
                </span>
              </div>

              <div className="mt-5 lg:hidden flex flex-wrap gap-2">
                {slide.brands.map((brand) => (
                  <Link
                    key={`${slide.id}-${brand.id}-mobile`}
                    to="/category/$category/brand/$brand"
                    params={{ category: slide.category, brand: brand.id }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 border border-white/25 hover:bg-white/25 transition-colors"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-200/95 font-semibold mb-4">
                  Featured In This Category
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {slide.brands.map((brand) => (
                    <Link
                      key={`${slide.id}-${brand.id}`}
                      to="/category/$category/brand/$brand"
                      params={{ category: slide.category, brand: brand.id }}
                      className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-colors p-3"
                    >
                      <div className="h-8 mb-2 flex items-center justify-center">
                        <img
                          src={`/brands/${brand.id}/logo.png`}
                          alt={`${brand.name} logo`}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="text-[11px] text-center text-slate-100 font-semibold leading-tight">
                        {brand.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center z-30">
        <button
          type="button"
          onClick={prevSlide}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
          aria-label="Previous slide"
        >
          {'<'}
        </button>
      </div>
      <div className="absolute inset-y-0 right-3 sm:right-4 flex items-center z-30">
        <button
          type="button"
          onClick={nextSlide}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
          aria-label="Next slide"
        >
          {'>'}
        </button>
      </div>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 w-[calc(100%-3rem)] sm:w-auto justify-center z-30">
        {slides.map((slide, index) => (
          <button
            type="button"
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 sm:h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-14 sm:w-18'
                : 'bg-white/45 hover:bg-white/75 w-8 sm:w-10'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            title={`Go to ${slide.eyebrow}`}
          >
            <span className="sr-only">{slide.eyebrow}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
