import { createFileRoute } from '@tanstack/react-router'
import SectionHeading from '../components/SectionHeading'
import BrandCard from '../components/BrandCard'

export const Route = createFileRoute('/category/$category')({
  component: CategoryPage,
})

// Placeholder brands data
const brandsByCategory: Record<string, any[]> = {
  luxury: [
    { id: 'mtf', name: 'MTF', description: 'Timeless elegance and sophistication' },
    { id: 'cosset', name: 'Cosset', description: 'Premium designer collections' },
    { id: 'maria-nasir', name: 'Maria Nasir', description: 'Luxury fashion and jewelry' },
  ],
  casual: [
    { id: 'd-m-collection', name: 'D&M Collection', description: 'Contemporary casual wear' },
    { id: 'sobia-nazir', name: 'Sobia Nazir', description: 'Elegant everyday fashion' },
    { id: 'jindhia', name: 'Jindhia', description: 'Modern casual style' },
  ],
  cheap: [
    { id: 'ameena', name: 'Ameena', description: 'Quality fashion on budget' },
    { id: 'uigc-collection', name: 'UIGC Collection', description: 'Affordable everyday wear' },
    { id: 'mirakk', name: 'Mirakk', description: 'Value-priced fashion' },
  ],
}

const categoryTitles: Record<string, string> = {
  luxury: 'Luxury Brands',
  casual: 'Casual Brands',
  cheap: 'Affordable Brands',
}

function CategoryPage() {
  const { category } = Route.useParams()
  const brands = brandsByCategory[category] || []
  const title = categoryTitles[category] || 'Brands'

  return (
    <div className="container mx-auto px-6 py-16">
      <SectionHeading
        title={title}
        subtitle={`Explore our curated selection of ${category} fashion brands`}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {brands.map((brand) => (
          <BrandCard key={brand.id} {...brand} category={category} />
        ))}
      </div>
    </div>
  )
}
