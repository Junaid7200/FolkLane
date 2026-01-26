import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 sm:mb-8">About FolkLane</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-700 mb-6">
            FolkLane is your premier destination for discovering authentic Pakistani clothing and jewelry brands.
            We curate the finest collections from luxury to affordable fashion, making it easy for you to explore
            and shop from Pakistan's most celebrated designers.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            To celebrate and promote Pakistani fashion heritage by connecting fashion enthusiasts with
            quality brands across all price ranges. Whether you're looking for luxury designer wear or
            budget-friendly daily essentials, FolkLane brings it all together in one place.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">What We Offer</h2>
          <ul className="text-gray-700 space-y-3 mb-6">
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">✓</span>
              <span>Curated collections from 9 premium Pakistani brands</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">✓</span>
              <span>Categories ranging from luxury to affordable fashion</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">✓</span>
              <span>Easy browsing and discovery of authentic Pakistani designs</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">✓</span>
              <span>Quality fashion for every occasion and budget</span>
            </li>
          </ul>

          <div className="bg-amber-50 border-l-4 border-amber-600 p-6 mt-12">
            <p className="text-lg text-gray-800">
              <strong>Coming Soon:</strong> We're working on bringing you live inventory updates,
              exclusive deals, and an even wider selection of Pakistani fashion brands.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
