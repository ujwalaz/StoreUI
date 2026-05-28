import StatusBadge from './StatusBadge'

export default function OrderCard({ order }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-700">Order #{order.id}</span>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
      {order.items && order.items.length > 0 && (
        <ul className="text-sm text-gray-600 space-y-0.5">
          {order.items.map(item => (
            <li key={item.id}>
              {item.productName || `Product #${item.productId}`} × {item.quantity} @ ₹{Number(item.unitPrice).toFixed(2)}
            </li>
          ))}
        </ul>
      )}
      <div className="text-sm font-bold text-gray-800">
        Total: ₹{Number(order.totalAmount).toFixed(2)}
      </div>
    </div>
  )
}
