import { createFileRoute, Link } from '@tanstack/react-router'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/catalog'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  const { totalItems, totalPrice } = useCart()

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Shipping Details
          </h2>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full name"
              className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <input
              type="text"
              placeholder="Phone"
              className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <input
              type="text"
              placeholder="City"
              className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <input
              type="text"
              placeholder="Street address"
              className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:col-span-2"
            />
            <textarea
              placeholder="Delivery notes (optional)"
              className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:col-span-2"
              rows={4}
            />
          </form>

          <div className="mt-6 text-sm text-gray-500">
            This is a demo checkout form. No payment will be processed.
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 h-fit">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Order Summary
          </h3>
          <div className="flex items-center justify-between text-gray-700 mb-2">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>
          <div className="flex items-center justify-between text-gray-900 font-semibold text-lg mb-6">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <button
            className="w-full text-center bg-slate-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg"
            type="button"
          >
            Place order (demo)
          </button>
          <Link
            to="/cart"
            className="block mt-4 text-center text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4"
          >
            Back to cart
          </Link>
        </div>
      </div>
    </div>
  )
}
