import { useSearchParams, Link } from 'react-router-dom'

export default function OrderConfirmed() {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800">Order Placed!</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Your order #{orderId} has been placed successfully.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/shop"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
            Continue Shopping
          </Link>
          <Link to="/my-orders"
            className="w-full border border-indigo-300 text-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
