import { createFileRoute } from '@tanstack/react-router'
import SectionHeading from '../components/SectionHeading'
import ItemCard from '../components/ItemCard'

export const Route = createFileRoute('/category_/$category/brand/$brand')({
  component: BrandPage,
})

// Placeholder items data - 5 items per brand
const itemsByBrand: Record<string, any[]> = {
  mtf: [
    { id: 'mtf-1', title: 'Elegant Bridal Dress', price: 45000, image: '/placeholder.jpg' },
    { id: 'mtf-2', title: 'Luxury Embroidered Shawl', price: 42000, image: '/placeholder.jpg' },
    { id: 'mtf-3', title: 'Designer Wedding Collection', price: 48000, image: '/placeholder.jpg' },
    { id: 'mtf-4', title: 'Premium Silk Ensemble', price: 39000, image: '/placeholder.jpg' },
    { id: 'mtf-5', title: 'Royal Festive Wear', price: 46000, image: '/placeholder.jpg' },
  ],
  cosset: [
    { id: 'cosset-1', title: 'Premium Silk Kurta', price: 38000, image: '/placeholder.jpg' },
    { id: 'cosset-2', title: 'Royal Collection Dress', price: 48000, image: '/placeholder.jpg' },
    { id: 'cosset-3', title: 'Luxury Evening Gown', price: 52000, image: '/placeholder.jpg' },
    { id: 'cosset-4', title: 'Designer Party Wear', price: 44000, image: '/placeholder.jpg' },
    { id: 'cosset-5', title: 'Exclusive Bridal Set', price: 55000, image: '/placeholder.jpg' },
  ],
  'maria-nasir': [
    { id: 'maria-1', title: 'Designer Jewelry Set', price: 52000, image: '/placeholder.jpg' },
    { id: 'maria-2', title: 'Gold Plated Necklace', price: 55000, image: '/placeholder.jpg' },
    { id: 'maria-3', title: 'Luxury Bridal Jewelry', price: 62000, image: '/placeholder.jpg' },
    { id: 'maria-4', title: 'Premium Earring Collection', price: 38000, image: '/placeholder.jpg' },
    { id: 'maria-5', title: 'Royal Jewelry Ensemble', price: 68000, image: '/placeholder.jpg' },
  ],
  'd-m-collection': [
    { id: 'dm-1', title: 'Contemporary Kurta Set', price: 8500, image: '/placeholder.jpg' },
    { id: 'dm-2', title: 'Modern Casual Wear', price: 7200, image: '/placeholder.jpg' },
    { id: 'dm-3', title: 'Stylish Summer Collection', price: 9800, image: '/placeholder.jpg' },
    { id: 'dm-4', title: 'Trendy Office Wear', price: 8900, image: '/placeholder.jpg' },
    { id: 'dm-5', title: 'Elegant Daily Dress', price: 7800, image: '/placeholder.jpg' },
  ],
  'sobia-nazir': [
    { id: 'sobia-1', title: 'Elegant Lawn Collection', price: 12500, image: '/placeholder.jpg' },
    { id: 'sobia-2', title: 'Summer Casual Wear', price: 9500, image: '/placeholder.jpg' },
    { id: 'sobia-3', title: 'Classic Formal Dress', price: 14000, image: '/placeholder.jpg' },
    { id: 'sobia-4', title: 'Stylish Kurta Set', price: 11000, image: '/placeholder.jpg' },
    { id: 'sobia-5', title: 'Modern Ethnic Wear', price: 13500, image: '/placeholder.jpg' },
  ],
  jindhia: [
    { id: 'jindhia-1', title: 'Casual Everyday Dress', price: 6500, image: '/placeholder.jpg' },
    { id: 'jindhia-2', title: 'Modern Kurta Collection', price: 7800, image: '/placeholder.jpg' },
    { id: 'jindhia-3', title: 'Trendy Summer Wear', price: 5900, image: '/placeholder.jpg' },
    { id: 'jindhia-4', title: 'Comfortable Daily Outfit', price: 6200, image: '/placeholder.jpg' },
    { id: 'jindhia-5', title: 'Stylish Casual Set', price: 7200, image: '/placeholder.jpg' },
  ],
  ameena: [
    { id: 'ameena-1', title: 'Cotton Summer Lawn', price: 2500, image: '/placeholder.jpg' },
    { id: 'ameena-2', title: 'Basic Trouser Set', price: 1500, image: '/placeholder.jpg' },
    { id: 'ameena-3', title: 'Simple Daily Wear', price: 1800, image: '/placeholder.jpg' },
    { id: 'ameena-4', title: 'Affordable Kurta', price: 2200, image: '/placeholder.jpg' },
    { id: 'ameena-5', title: 'Budget Friendly Dress', price: 1900, image: '/placeholder.jpg' },
  ],
  'uigc-collection': [
    { id: 'uigc-1', title: 'Everyday Dupatta', price: 1200, image: '/placeholder.jpg' },
    { id: 'uigc-2', title: 'Cotton Scarf', price: 950, image: '/placeholder.jpg' },
    { id: 'uigc-3', title: 'Simple Casual Dress', price: 1600, image: '/placeholder.jpg' },
    { id: 'uigc-4', title: 'Basic Summer Wear', price: 1400, image: '/placeholder.jpg' },
    { id: 'uigc-5', title: 'Value Cotton Set', price: 1800, image: '/placeholder.jpg' },
  ],
  mirakk: [
    { id: 'mirakk-1', title: 'Casual Kurta Set', price: 1800, image: '/placeholder.jpg' },
    { id: 'mirakk-2', title: 'Simple Earrings', price: 800, image: '/placeholder.jpg' },
    { id: 'mirakk-3', title: 'Budget Accessories', price: 1100, image: '/placeholder.jpg' },
    { id: 'mirakk-4', title: 'Affordable Daily Wear', price: 1500, image: '/placeholder.jpg' },
    { id: 'mirakk-5', title: 'Value Jewelry Set', price: 1200, image: '/placeholder.jpg' },
  ],
}

const brandNames: Record<string, string> = {
  mtf: 'MTF',
  cosset: 'Cosset',
  'maria-nasir': 'Maria Nasir',
  'd-m-collection': 'D&M Collection',
  'sobia-nazir': 'Sobia Nazir',
  jindhia: 'Jindhia',
  ameena: 'Ameena',
  'uigc-collection': 'UIGC Collection',
  mirakk: 'Mirakk',
}

function BrandPage() {
  const { category, brand } = Route.useParams()
  const items = itemsByBrand[brand] || []
  const brandName = brandNames[brand] || brand

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
