import { createFileRoute } from '@tanstack/react-router'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Slider from '../components/Slider'
import CategoryCards from '../components/CategoryCards'
import SectionHeading from '../components/SectionHeading'
import ItemCard from '../components/ItemCard'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

// Placeholder items data
const luxuryItems = [
  { id: 'mtf-1', title: 'Elegant Bridal Dress', price: 45000, image: '/placeholder.jpg', brand: 'mtf', category: 'luxury' },
  { id: 'cosset-1', title: 'Premium Silk Kurta', price: 38000, image: '/placeholder.jpg', brand: 'cosset', category: 'luxury' },
  { id: 'maria-1', title: 'Designer Jewelry Set', price: 52000, image: '/placeholder.jpg', brand: 'maria-nasir', category: 'luxury' },
  { id: 'mtf-2', title: 'Luxury Embroidered Shawl', price: 42000, image: '/placeholder.jpg', brand: 'mtf', category: 'luxury' },
  { id: 'cosset-2', title: 'Royal Collection Dress', price: 48000, image: '/placeholder.jpg', brand: 'cosset', category: 'luxury' },
  { id: 'maria-2', title: 'Gold Plated Necklace', price: 55000, image: '/placeholder.jpg', brand: 'maria-nasir', category: 'luxury' },
]

const cheapItems = [
  { id: 'ameena-1', title: 'Cotton Summer Lawn', price: 2500, image: '/placeholder.jpg', brand: 'ameena', category: 'cheap' },
  { id: 'mirakk-1', title: 'Casual Kurta Set', price: 1800, image: '/placeholder.jpg', brand: 'mirakk', category: 'cheap' },
  { id: 'uigc-1', title: 'Everyday Dupatta', price: 1200, image: '/placeholder.jpg', brand: 'uigc-collection', category: 'cheap' },
  { id: 'ameena-2', title: 'Basic Trouser Set', price: 1500, image: '/placeholder.jpg', brand: 'ameena', category: 'cheap' },
  { id: 'mirakk-2', title: 'Simple Earrings', price: 800, image: '/placeholder.jpg', brand: 'mirakk', category: 'cheap' },
  { id: 'uigc-2', title: 'Cotton Scarf', price: 950, image: '/placeholder.jpg', brand: 'uigc-collection', category: 'cheap' },
]

function IndexPage() {
  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Marquee */}
      <Marquee />

      {/* Slider Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <Slider />
      </section>

      {/* Category Cards Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <SectionHeading
          title="Shop by Category"
          subtitle="Explore our curated collections from luxury to affordable"
        />
        <CategoryCards />
      </section>

      {/* Luxury Items Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            title="Luxury Collection"
            subtitle="Our most exclusive and premium pieces"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {luxuryItems.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Affordable Items Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeading
            title="Affordable Finds"
            subtitle="Quality fashion that fits your budget"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {cheapItems.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
