import { createFileRoute } from '@tanstack/react-router'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Slider from '../components/Slider'
import CategoryCards from '../components/CategoryCards'
import SectionHeading from '../components/SectionHeading'
import ItemCard from '../components/ItemCard'
import { getFeaturedItems } from '../data/catalog'

function IndexPage() {
  const luxuryItems = Route.useLoaderData().luxuryItems
  const cheapItems = Route.useLoaderData().cheapItems

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
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                image={item.image}
                brand={item.brandId}
                category="luxury"
              />
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
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                image={item.image}
                brand={item.brandId}
                category="cheap"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: IndexPage,
  loader: async () => {
    const luxuryItems = await getFeaturedItems({ sort: 'desc', limit: 6 })
    const cheapItems = await getFeaturedItems({ sort: 'asc', limit: 6 })
    return { luxuryItems, cheapItems }
  },
})
