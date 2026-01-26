import { createFileRoute } from '@tanstack/react-router'
import ItemDetail from '@/components/ItemDetail'

export const Route = createFileRoute(
  '/category_/$category/brand_/$brand/item/$itemid',
)({
  component: ItemPage,
})

// Placeholder item details
const allItems: Record<string, any> = {
  'mtf-1': { title: 'Elegant Bridal Dress', price: 45000, description: 'A stunning bridal dress crafted with intricate embroidery and premium fabrics. Perfect for your special day, this piece combines traditional elegance with contemporary design.', brand: 'MTF' },
  'cosset-1': { title: 'Premium Silk Kurta', price: 38000, description: 'Luxurious silk kurta featuring delicate handwork and modern silhouette. Ideal for formal occasions and celebrations.', brand: 'Cosset' },
  'maria-1': { title: 'Designer Jewelry Set', price: 52000, description: 'Exquisite jewelry set with traditional motifs and modern craftsmanship. Includes necklace, earrings, and matching accessories.', brand: 'Maria Nasir' },
  'dm-1': { title: 'Contemporary Kurta Set', price: 8500, description: 'Modern kurta set perfect for everyday wear. Comfortable fabric with stylish contemporary design.', brand: 'D&M Collection' },
  'sobia-1': { title: 'Elegant Lawn Collection', price: 12500, description: 'Premium lawn fabric with beautiful prints and elegant design. Perfect for summer occasions.', brand: 'Sobia Nazir' },
  'jindhia-1': { title: 'Casual Everyday Dress', price: 6500, description: 'Comfortable and stylish dress for daily wear. Easy to maintain with modern casual design.', brand: 'Jindhia' },
  'ameena-1': { title: 'Cotton Summer Lawn', price: 2500, description: 'Affordable cotton lawn perfect for hot summer days. Breathable fabric with attractive prints.', brand: 'Ameena' },
  'uigc-1': { title: 'Everyday Dupatta', price: 1200, description: 'Simple and elegant dupatta for everyday use. Versatile and budget-friendly.', brand: 'UIGC Collection' },
  'mirakk-1': { title: 'Casual Kurta Set', price: 1800, description: 'Budget-friendly kurta set with good quality fabric. Perfect for casual occasions.', brand: 'Mirakk' },
}

function ItemPage() {
  const { itemid } = Route.useParams()
  const item = allItems[itemid] || {
    title: 'Product Not Found',
    price: 0,
    description: 'This item is currently unavailable.',
    brand: 'Unknown',
  }

  return (
    <ItemDetail
      title={item.title}
      price={item.price}
      description={item.description}
      image="/placeholder.jpg"
      brand={item.brand}
    />
  )
}
