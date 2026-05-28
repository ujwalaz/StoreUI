import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCustomerOrders } from '../../api/orders'
import OrderCard from '../../components/OrderCard'

export default function MyOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['customerOrders'],
    queryFn: getCustomerOrders
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/shop" className="text-indigo-600 hover:underline text-sm">← Back to Shop</Link>
          <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
        </div>
        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p>No orders yet. Start shopping!</p>
            <Link to="/shop" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </div>
    </div>
  )
}
