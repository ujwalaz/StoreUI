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
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="mt-1 text-sm text-indigo-100">Track your recent purchases and delivery progress.</p>
          </div>
          <Link to="/shop" className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10">
            ← Back to Shop
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-6xl">🛍️</p>
            <h2 className="mt-4 text-xl font-bold text-gray-800">No orders yet</h2>
            <p className="mt-2 text-sm text-gray-500">Your grocery orders will appear here once you place your first one.</p>
            <Link to="/shop" className="mt-6 inline-block rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Most Recent</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
            {orders.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </div>
    </div>
  )
}
