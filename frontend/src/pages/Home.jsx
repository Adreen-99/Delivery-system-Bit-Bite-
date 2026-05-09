import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRestaurants } from '../services/api'
import { useUser } from '../context/UserContext'
import Logo from '../components/Logo'

export default function Home() {
  const { user } = useUser()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRestaurants()
      .then(res => setRestaurants(res.data))
      .catch(err => console.error('Failed to load restaurants:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 dark:from-orange-600 dark:via-red-700 dark:to-gray-900">
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Delicious Food,{' '}
                <span className="text-yellow-300">Paid with Bitcoin</span>
              </h1>
              <p className="text-white/80 text-lg lg:text-xl mt-6 max-w-xl">
                Order from the best local restaurants and pay instantly with Bitcoin Lightning.
                Fast, cheap, and private.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
                {user ? (
                  <span className="inline-block bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg">
                    Welcome back, {user.name}!
                  </span>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg text-center"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors text-center"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 lg:w-80 lg:h-80 bg-orange-400/30 rounded-full blur-xl absolute -inset-4"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="text-7xl text-center mb-4">⚡</div>
                  <p className="text-white font-bold text-xl text-center">Lightning Fast</p>
                  <p className="text-white/60 text-sm text-center mt-2">Pay in seconds</p>
                  <div className="mt-6 flex justify-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-white/80 text-xs">Network ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-950 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Why Bit-Bite?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-2xl mx-auto mb-12">
            The first food delivery platform built on Bitcoin Lightning
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Instant Payments', desc: 'No waiting for bank transfers. Pay and confirm in seconds with Lightning.' },
              { icon: '🪙', title: 'Low Fees', desc: 'Fraction of a cent per transaction. No hidden credit card fees.' },
              { icon: '🔒', title: 'Private & Secure', desc: 'No banking details needed. Your payments are pseudonymous and secure.' },
            ].map(f => (
              <div key={f.title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Available Restaurants
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Order from these fine establishments</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading restaurants...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <p className="text-gray-500 dark:text-gray-400">No restaurants available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(restaurant => (
                <Link
                  key={restaurant.id}
                  to={`/restaurant/${restaurant.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700 transition-all"
                >
                  <div className="h-48 bg-gradient-to-br from-orange-400 to-red-400 dark:from-orange-700 dark:to-red-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white rounded-full blur-2xl"></div>
                    </div>
                    {restaurant.logo_url ? (
                      <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl relative z-10">🍕</span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                      {restaurant.description || 'Delicious food delivered to your door'}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{restaurant.address}</span>
                      <span className="text-orange-600 dark:text-orange-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Order &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-700 dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to order?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Create an account and start paying with Bitcoin Lightning today.
            </p>
            <Link
              to="/signup"
              className="inline-block bg-white text-orange-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Logo />
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Powered by Bitcoin Lightning</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-4">&copy; 2026 Bit-Bite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
