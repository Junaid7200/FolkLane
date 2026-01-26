import { useState, useEffect } from 'react'

export default function Slider() {
  const slides = [
    { id: 1, text: 'Summer Collection 2026', color: 'bg-rose-400' },
    { id: 2, text: 'Winter Elegance', color: 'bg-indigo-400' },
    { id: 3, text: 'Traditional Craftsmanship', color: 'bg-emerald-400' },
  ]

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="relative h-64 sm:h-72 md:h-96 bg-gray-900 rounded-2xl overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`w-full h-full ${slide.color} flex items-center justify-center`}>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white px-6 text-center">
              {slide.text}
            </h2>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-6 sm:w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
