import BrandCard from './BrandCard'

type Brand = {
  id: string
  name: string
  category: string
  description?: string
}

export default function BrandSlider({ brands }: { brands: Brand[] }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 snap-x snap-mandatory items-stretch">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="snap-start min-w-[80%] sm:min-w-[45%] lg:min-w-[30%] h-full"
          >
            <BrandCard
              id={brand.id}
              name={brand.name}
              category={brand.category}
              description={brand.description}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
