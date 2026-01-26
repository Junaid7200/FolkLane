import { createFileRoute, Link } from '@tanstack/react-router'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/catalog'
import ImagePlaceholder from '../components/ImagePlaceholder'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } =
    useCart()

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Your Cart
        </h1>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-4 w-fit"
          >
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <p className="text-lg text-gray-700 mb-6">Your cart is empty.</p>
          <Link
            to="/"
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-full text-base font-semibold hover:bg-amber-700 transition-all shadow-lg"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white rounded-xl shadow-md p-4 sm:p-6"
              >
                <div className="w-full sm:w-28 md:w-32 aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  {item.image && item.image !== '/placeholder.jpg' ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImagePlaceholder className="w-full h-full" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wide text-amber-600 font-semibold mb-1">
                    {item.brand}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h2>
                  <div className="text-amber-600 font-bold mb-4">
                    {formatPrice(item.price)}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Qty</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="min-w-[2rem] text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
            <Link
              to="/checkout"
              className="block w-full text-center bg-amber-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-amber-700 transition-all shadow-lg"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
