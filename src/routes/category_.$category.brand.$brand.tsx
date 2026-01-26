import { createFileRoute } from '@tanstack/react-router'
import SectionHeading from '../components/SectionHeading'
import ItemCard from '../components/ItemCard'
import { getBrandsByCategory, getItemsByBrand, isCategory } from '../data/catalog'

export const Route = createFileRoute('/category_/$category/brand/$brand')({
  component: BrandPage,
  loader: async ({ params }) => {
    const items = await getItemsByBrand(params.brand)
    const brands = isCategory(params.category)
      ? await getBrandsByCategory(params.category)
      : []
    const brand = brands.find((b) => b.id === params.brand)
    return {
      items,
      brandName: brand?.name ?? params.brand,
    }
  },
})

function BrandPage() {
  const { category, brand } = Route.useParams()
  const { items, brandName } = Route.useLoaderData()

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <SectionHeading
        title={brandName}
        subtitle={`Explore the complete ${brandName} collection`}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-12">
        {items.map((item) => (
          <ItemCard key={item.id} {...item} brand={brand} category={category} />
        ))}
      </div>
    </div>
  )
}
