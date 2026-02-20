import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 sm:mb-8">
          About Us
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-700 mb-6">
            We are building a unified platform dedicated to the clothing industry of Pakistan, a space where creativity, craftsmanship, and commerce come together under one roof.
          </p>

          <p className="text-gray-700 mb-4">
            <strong>Our mission is simple:</strong><br />
            to connect, empower, and digitally transform local fashion and clothing businesses by helping them grow beyond physical stores and reach a wider audience online.
          </p>

          <p className="text-gray-700 mb-8">
            Pakistan's clothing industry is rich with talent, tradition, and innovation. From small local boutiques to growing fashion labels, many brands still rely only on offline sales and lack the digital presence needed to compete in today's market. We exist to bridge that gap.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Our Vision</h2>
          <p className="text-gray-700 mb-4">
            To become the leading digital hub for Pakistan's clothing industry, a platform where brands, designers, and customers connect easily in one ecosystem.
          </p>
          <p className="text-gray-700 mb-8">
            We believe that when local businesses are given the right digital tools, they can expand faster, build stronger brands, and compete on a global level.
          </p>


          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            Our platform focuses on two core goals:
          </p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bringing the Clothing Industry Under One Roof
            </h3>
            <p className="text-gray-700">
              We aim to create a centralized space where clothing brands, manufacturers, designers, and retailers can showcase their work, collaborate, and grow together.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Creating Digital Presence for Local Brands
            </h3>
            <p className="text-gray-700">
              Many talented local brands operate purely offline. We help them step into the digital world by providing visibility, online representation, and access to new markets.
            </p>
          </div>


          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Who We Work With</h2>
          <p className="text-gray-700 mb-4">We welcome:</p>
          <ul className="text-gray-700 space-y-2 mb-8 ml-4">
            <li>• Local fashion brands</li>
            <li>• Boutique owners</li>
            <li>• Manufacturers & wholesalers</li>
            <li>• Independent designers</li>
            <li>• Offline clothing businesses looking to go digital</li>
          </ul>


          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Why We Exist</h2>
          <p className="text-gray-700 mb-4">
            Pakistan has a powerful fashion culture and skilled craftsmanship. Yet, countless brands remain undiscovered due to limited digital exposure.
          </p>
          <p className="text-gray-700 mb-8">
            Our goal is to make digital growth simple, accessible, and affordable, so every clothing business, no matter its size, has the opportunity to thrive.
          </p>


          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Our Promise</h2>
          <p className="text-gray-700 mb-4">
            We are not just a marketplace, we are a growth partner for local brands.
          </p>
          <p className="text-gray-700">
            By combining technology, branding, and industry knowledge, we aim to build a stronger future for Pakistan's clothing industry.
          </p>
        </div>
      </div>
    </div>
  )
}
