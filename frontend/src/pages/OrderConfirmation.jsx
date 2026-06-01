import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QRCodeSVG } from "qrcode.react"
import { API_URL, authHeaders } from '../services/api'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [polling, setPolling] = useState(false)
  const paymentHash = order?.payment?.payment_hash

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, { headers: authHeaders() })
      const data = await res.json()
      setOrder(data)
      setPaymentStatus(data.payment?.status || 'pending')
    } catch (err) {
      console.error('Failed to load order:', err)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  const checkPayment = useCallback(async () => {
    if (!paymentHash) return
    try {
      const res = await fetch(`${API_URL}/payments/check/${paymentHash}`, { headers: authHeaders() })
      const data = await res.json()
      setOrder(data.order)
      setPaymentStatus(data.payment.status)
      if (data.payment.status === 'paid') setPolling(false)
    } catch (err) {
      console.error('Payment check failed:', err)
    }
  }, [paymentHash])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  useEffect(() => {
    if (paymentStatus === 'paid') return
    const interval = setInterval(() => checkPayment(), 5000)
    return () => clearInterval(interval)
  }, [paymentStatus, checkPayment])

  const copyInvoice = () => {
    if (order?.payment?.payment_request) {
      navigator.clipboard.writeText(order.payment.payment_request)
    }
  }

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

  const totalSats = order.total_sats

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6 text-center shadow-sm">
          <div className="text-5xl mb-4">{paymentStatus === 'paid' ? '✅' : '⏳'}</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {paymentStatus === 'paid' ? 'Payment Received!' : 'Awaiting Payment'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Order #{order.order_number}</p>
        </div>

        {paymentStatus === 'paid' ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="text-center mb-6">
              <p className="text-green-600 dark:text-green-400 font-bold text-lg mb-2">
                Your payment of {totalSats} sats was successful!
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Your order is now being prepared and will be delivered soon.
              </p>
            </div>
            <Link to={`/track/${order.id}`}
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-xl font-bold transition-colors"
            >
              Track Your Order
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pay with Lightning</h2>
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">{totalSats} sats</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Scan the QR code or copy the invoice below</p>
            </div>

            {order.payment?.payment_request && (
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-2xl">
                  <QRCodeSVG value={order.payment.payment_request} size={256} />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lightning Invoice</label>
              <div className="flex gap-2">
                <input type="text" readOnly
                  value={order.payment?.payment_request || ''}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm break-all"
                />
                <button onClick={copyInvoice}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-xl font-medium transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ⚡ Pay using any Lightning wallet (Zeus, BlueWallet, etc.)
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                The invoice expires in 30 minutes.
              </p>
            </div>

            <button onClick={checkPayment} disabled={polling}
              className="w-full mt-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors disabled:bg-orange-300"
            >
              {polling ? 'Checking payment...' : 'I have paid the invoice'}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
