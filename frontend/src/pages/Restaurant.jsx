import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_URL } from '../services/api'
import { useCart } from '../context/CartContext'

export default function Restaurant() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem, items, getTotal } = useCart()

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/restaurants/${id}`).then(r => r.json()),
      fetch(`${API_URL}/restaurants/${id}/menu`).then(r => r.json())
    ])
      .then(([rest, menu]) => {
        setRestaurant(rest)
        setMenuItems(menu)
      })
      .catch(err => console.error('Failed to load:', err))
      .finally(() => setLoading(false))
  }, [id])

  const isCartFromThisRestaurant = items.length > 0 && items[0].restaurant_id === parseInt(id)

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!restaurant) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Restaurant not found</div>
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-700 dark:to-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="text-white/70 hover:text-white mb-4 inline-block text-sm transition-colors">
            &larr; Back to restaurants
          </Link>
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <p className="text-white/80 mt-2">{restaurant.description}</p>
          <p className="text-sm text-white/60 mt-1">{restaurant.address}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Menu</h2>

            {menuItems.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 text-center text-gray-500 dark:text-gray-400">
                No menu items available
              </div>
            ) : (
              <div className="space-y-3">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        '🍽️'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{item.description}</p>
                      <p className="text-orange-600 dark:text-orange-400 font-bold mt-1">{item.price_sats} sats</p>
                    </div>
                    <button
                      onClick={() => addItem(item, restaurant)}
                      disabled={!item.is_available}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors shrink-0 ${
                        item.is_available
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {item.is_available ? 'Add' : 'Unavailable'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isCartFromThisRestaurant && (
            <div className="lg:w-80">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sticky top-20 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Order</h3>

                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium truncate">{item.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">&times;{item.quantity}</p>
                      </div>
                      <p className="text-orange-600 dark:text-orange-400 font-bold ml-2">
                        {item.price_sats * item.quantity} sats
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">{getTotal()} sats</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Platform Fee</span>
                    <span className="text-gray-900 dark:text-white font-medium">10 sats</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                    <span className="text-gray-900 dark:text-white font-medium">50 sats</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-orange-600 dark:text-orange-400">{getTotal() + 60} sats</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-xl font-bold transition-colors mt-4"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                  Pay with Bitcoin Lightning ⚡
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
