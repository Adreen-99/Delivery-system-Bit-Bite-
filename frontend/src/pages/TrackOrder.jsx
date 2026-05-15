import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_URL } from '../services/api'

export default function TrackOrder() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [orderRes, deliveryRes] = await Promise.all([
        fetch(`${API_URL}/orders/${orderId}`).then(r => r.json()),
        fetch(`${API_URL}/delivery/${orderId}`).then(r => r.json())
      ])
      setOrder(orderRes)
      setDelivery(deliveryRes)
    } catch (err) {
      console.error('Failed to load order:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [orderId])

  const getStatusIcon = (status) => {
    const icons = { pending: '⏳', confirmed: '✅', preparing: '👨‍🍳', ready: '📦', in_transit: '🚴', delivered: '🏠' }
    return icons[status] || '📋'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Order placed, waiting for payment',
      confirmed: 'Payment confirmed',
      preparing: 'Being prepared',
      ready: 'Ready for delivery',
      in_transit: 'On the way',
      delivered: 'Delivered'
    }
    return texts[status] || status
  }

  const deliverySteps = ['preparing', 'ready', 'in_transit', 'delivered']
  const currentStepIndex = deliverySteps.indexOf(delivery?.status || 'preparing')

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order not found</h2>
          <Link to="/" className="text-orange-500 hover:underline">Return home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/" className="text-orange-600 dark:text-orange-400 hover:underline mb-4 inline-block text-sm">
          &larr; Back to Home
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.order_number}</h1>
              <p className="text-gray-500 dark:text-gray-400">{order.restaurant.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{order.total_sats} sats</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {order.payment?.status === 'paid' ? 'Paid' : 'Pending'}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delivery Status</h2>
            <div className="relative">
              {deliverySteps.map((step, index) => {
                const isActive = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                return (
                  <div key={step} className="flex items-start mb-6 last:mb-0">
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                      isActive ? 'bg-orange-500 dark:bg-orange-600' : 'bg-gray-200 dark:bg-gray-600'
                    } ${isCurrent ? 'ring-4 ring-orange-200 dark:ring-orange-800' : ''}`}>
                      <span className="text-xl">{getStatusIcon(step)}</span>
                    </div>
                    <div className="ml-4">
                      <p className={`font-medium ${isCurrent ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                        {step.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getStatusText(step)}</p>
                      {step === delivery?.status && delivery?.driver_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Driver: {delivery.driver_name} ({delivery.driver_contact})
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Address</p>
                <p className="font-medium text-gray-900 dark:text-white">{delivery?.delivery_address}</p>
              </div>
              {delivery?.estimated_time && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">{delivery.estimated_time} minutes</p>
                </div>
              )}
              {delivery?.delivered_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Delivered At</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(delivery.delivered_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Order Items</h2>
            <div className="space-y-2">
              {order.items?.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.menu_item.name}</p>
                    <p className="text-gray-500 dark:text-gray-400">&times;{item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.quantity * item.price_sats} sats</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
