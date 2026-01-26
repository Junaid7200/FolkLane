import { createFileRoute } from '@tanstack/react-router'
import ItemDetail from '@/components/ItemDetail'
import { getBrandsByCategory, getItemById, isCategory } from '@/data/catalog'

export const Route = createFileRoute(
  '/category_/$category/brand_/$brand/item/$itemid',
)({
  component: ItemPage,
  loader: async ({ params }) => {
    const item = await getItemById(params.itemid)
    const brands = isCategory(params.category)
      ? await getBrandsByCategory(params.category)
      : []
    const brand = brands.find((b) => b.id === params.brand)
    return {
      item,
      brandName: brand?.name ?? params.brand,
    }
  },
})

function ItemPage() {
  const { item, brandName } = Route.useLoaderData()
  const fallback = {
    title: 'Product Not Found',
    price: 0,
    description: 'This item is currently unavailable.',
    image: '/placeholder.jpg',
  }
  const displayItem = item ?? fallback
  const displayBrand = item ? brandName : 'Unknown'

  return (
    <ItemDetail
      title={displayItem.title}
      price={displayItem.price}
      description={displayItem.description}
      image={displayItem.image}
      brand={displayBrand}
    />
  )
}
