import StatusBadge from './StatusBadge'

const BORDER_STYLES = {
  pending: 'border-amber-400',
  confirmed: 'border-indigo-500',
  shipped: 'border-purple-500',
  delivered: 'border-emerald-500',
  cancelled: 'border-rose-500',
}

export default function OrderCard({ order }) {
  return (
    <div className={`rounded-2xl border border-gray-100 border-l-4 bg-white p-5 shadow-sm ${BORDER_STYLES[order.status] || 'border-gray-300'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Order</p>
          <h3 className="text-lg font-bold text-gray-800">#{order.id}</h3>
          <p className="mt-1 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={order.status} />
          <span className="text-base font-bold text-gray-900">₹{Number(order.totalAmount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}