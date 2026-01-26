import { createFileRoute } from '@tanstack/react-router'
import SectionHeading from '../components/SectionHeading'
import BrandCard from '../components/BrandCard'
import { getBrandsByCategory, isCategory } from '../data/catalog'

export const Route = createFileRoute('/category/$category')({
  component: CategoryPage,
  loader: async ({ params }) => {
    if (!isCategory(params.category)) {
      return { brands: [], title: 'Brands', category: params.category }
    }
    const brands = await getBrandsByCategory(params.category)
    const titleByCategory: Record<string, string> = {
      luxury: 'Luxury Brands',
      casual: 'Casual Brands',
      cheap: 'Affordable Brands',
    }
    return {
      brands,
      title: titleByCategory[params.category] || 'Brands',
      category: params.category,
    }
  },
})

function CategoryPage() {
  const data = Route.useLoaderData()
  const { category, title, brands } = data

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <SectionHeading
        title={title}
        subtitle={`Explore our curated selection of ${category} fashion brands`}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-12">
        {brands.map((brand) => (
          <BrandCard key={brand.id} {...brand} category={category} />
        ))}
      </div>
    </div>
  )
}
