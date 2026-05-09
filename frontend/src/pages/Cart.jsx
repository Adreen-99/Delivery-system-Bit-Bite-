import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, restaurantName, updateQuantity, getTotal, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Add some delicious food from a restaurant!</p>
          <Link
            to="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    )
  }

  const platformFee = 10
  const deliveryFee = 50

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Cart</h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{restaurantName}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Order from this restaurant</p>
            </div>
            <button onClick={clearCart} className="text-red-500 text-sm hover:underline">
              Clear Cart
            </button>
          </div>

          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-50 dark:border-gray-700/50">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  🍽️
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.name}</h3>
                  <p className="text-orange-600 dark:text-orange-400 font-bold text-sm">{item.price_sats} sats each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="font-bold text-gray-900 dark:text-white">{item.price_sats * item.quantity} sats</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{getTotal()} sats</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Platform Fee</span>
                <span className="text-gray-900 dark:text-white">{platformFee} sats</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                <span className="text-gray-900 dark:text-white">{deliveryFee} sats</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-orange-600 dark:text-orange-400">{getTotal() + platformFee + deliveryFee} sats</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-center font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/checkout"
              className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-center font-bold transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
