import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { API_URL } from '../services/api'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, restaurantId, restaurantName, getTotal, clearCart } = useCart()
  const { user } = useUser()

  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const subtotal = getTotal()
  const total = getTotal() + 60

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const orderData = {
        user_id: user?.id || 1,
        restaurant_id: restaurantId,
        items: items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        })),
        delivery_address: deliveryAddress
      }

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create order')
      const { order, payment } = await res.json()

      clearCart()
      navigate(`/order/${order.id}`, { state: { order, payment } })
    } catch (err) {
      setError(err.message || 'Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <Link
            to="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium mt-4 transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delivery Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!user && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Address</label>
                <textarea
                  value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  rows="3" required placeholder="Enter your full delivery address"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors disabled:bg-orange-300 text-lg"
              >
                {loading ? 'Processing...' : 'Place Order & Get Lightning Invoice'}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

            <div className="pb-4 border-b border-gray-100 dark:border-gray-700">
              <p className="font-medium text-lg text-gray-900 dark:text-white">{restaurantName}</p>
            </div>

            <div className="py-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{item.name} &times; {item.quantity}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.price_sats * item.quantity} sats</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{subtotal} sats</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Platform Fee</span>
                <span className="text-gray-900 dark:text-white">10 sats</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                <span className="text-gray-900 dark:text-white">50 sats</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total (Lightning)</span>
                <span className="text-orange-600 dark:text-orange-400">{total} sats</span>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ⚡ You&apos;ll receive a Lightning invoice to pay with Bitcoin after placing your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
