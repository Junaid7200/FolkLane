import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-slate-50 via-white to-stone-100 py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
              About Us
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
              We are building a unified platform dedicated to the clothing industry of Pakistan, a space where creativity, craftsmanship, and commerce come together under one roof.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-gray-100">
              <p className="text-lg sm:text-xl text-gray-700 mb-4 leading-relaxed">
                <strong className="text-gray-900 text-xl sm:text-2xl">Our mission is simple:</strong><br />
                to connect, empower, and digitally transform local fashion and clothing businesses by helping them grow beyond physical stores and reach a wider audience online.
              </p>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Pakistan's clothing industry is rich with talent, tradition, and innovation. From small local boutiques to growing fashion labels, many brands still rely only on offline sales and lack the digital presence needed to compete in today's market. We exist to bridge that gap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-slate-900 py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 text-center">Our Vision</h2>
            <p className="text-lg sm:text-xl text-gray-100 mb-6 leading-relaxed text-center">
              To become the leading digital hub for Pakistan's clothing industry, a platform where brands, designers, and customers connect easily in one ecosystem.
            </p>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed text-center">
              We believe that when local businesses are given the right digital tools, they can expand faster, build stronger brands, and compete on a global level.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Goals */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg sm:text-xl text-gray-700 mb-12 text-center">
              Our platform focuses on two core goals:
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                  Bringing the Clothing Industry Under One Roof
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  We aim to create a centralized space where clothing brands, manufacturers, designers, and retailers can showcase their work, collaborate, and grow together.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                  Creating Digital Presence for Local Brands
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Many talented local brands operate purely offline. We help them step into the digital world by providing visibility, online representation, and access to new markets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 text-center">Who We Work With</h2>
            <p className="text-lg sm:text-xl text-gray-700 mb-10 text-center">We welcome:</p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <div className="flex items-start space-x-3 p-5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-amber-500 text-xl shrink-0 mt-1">•</span>
                <span className="text-base sm:text-lg text-gray-800">Local fashion brands</span>
              </div>
              <div className="flex items-start space-x-3 p-5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-amber-500 text-xl shrink-0 mt-1">•</span>
                <span className="text-base sm:text-lg text-gray-800">Boutique owners</span>
              </div>
              <div className="flex items-start space-x-3 p-5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-amber-500 text-xl shrink-0 mt-1">•</span>
                <span className="text-base sm:text-lg text-gray-800">Manufacturers & wholesalers</span>
              </div>
              <div className="flex items-start space-x-3 p-5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-amber-500 text-xl shrink-0 mt-1">•</span>
                <span className="text-base sm:text-lg text-gray-800">Independent designers</span>
              </div>
              <div className="flex items-start space-x-3 p-5 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
                <span className="text-amber-500 text-xl shrink-0 mt-1">•</span>
                <span className="text-base sm:text-lg text-gray-800">Offline clothing businesses looking to go digital</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="bg-linear-to-br from-amber-50 via-white to-slate-50 py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8 text-center">Why We Exist</h2>
            <div className="bg-white/80 backdrop-blur p-8 sm:p-10 rounded-2xl shadow-lg border border-amber-200">
              <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
                Pakistan has a powerful fashion culture and skilled craftsmanship. Yet, countless brands remain undiscovered due to limited digital exposure.
              </p>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Our goal is to make digital growth simple, accessible, and affordable, so every clothing business, no matter its size, has the opportunity to thrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-16 md:py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">Our Promise</h2>
            <p className="text-lg sm:text-xl text-gray-100 mb-6 leading-relaxed">
              We are not just a marketplace, we are a growth partner for local brands.
            </p>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              By combining technology, branding, and industry knowledge, we aim to build a stronger future for Pakistan's clothing industry.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
