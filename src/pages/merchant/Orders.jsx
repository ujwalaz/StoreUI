import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MerchantLayout from '../../components/MerchantLayout'
import StatusBadge from '../../components/StatusBadge'
import { getMerchantOrders, updateOrderStatus, cancelOrder } from '../../api/orders'

const TABS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

const NEXT_STATUS = {
  pending: { label: 'Confirm', next: 'confirmed', cls: 'bg-blue-600 text-white hover:bg-blue-700' },
  confirmed: { label: 'Mark Shipped', next: 'shipped', cls: 'bg-purple-600 text-white hover:bg-purple-700' },
  shipped: { label: 'Mark Delivered', next: 'delivered', cls: 'bg-green-600 text-white hover:bg-green-700' },
}

export default function Orders() {
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab')
    return TABS.includes(t) ? t : 'All'
  })
  const status = tab === 'All' ? undefined : tab.toLowerCase()

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['mOrders', tab],
    queryFn: () => getMerchantOrders(status)
  })

  const advance = useMutation({
    mutationFn: ({ id, nextStatus }) => updateOrderStatus(id, nextStatus),
    onSuccess: () => { qc.invalidateQueries(['mOrders']); qc.invalidateQueries(['mProducts']) }
  })

  const cancel = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => qc.invalidateQueries(['mOrders'])
  })

  return (
    <MerchantLayout title="Orders">
      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-5">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No orders found</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const nextAction = NEXT_STATUS[order.status]
            const canCancel = !['delivered', 'cancelled'].includes(order.status)
            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800">Order #{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('en-IN')}</span>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="text-sm text-gray-600 space-y-0.5 mb-3">
                    {order.items.map(i => (
                      <div key={i.id} className="flex justify-between">
                        <span>{i.productName || `Product #${i.productId}`} × {i.quantity}</span>
                        <span>@ ₹{Number(i.unitPrice).toFixed(2)} = ₹{Number(i.subtotal ?? i.unitPrice * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-bold text-gray-800">Total: ₹{Number(order.totalAmount).toFixed(2)}</span>
                  <div className="flex gap-2">
                    {nextAction && (
                      <button
                        onClick={() => advance.mutate({ id: order.id, nextStatus: nextAction.next })}
                        disabled={advance.isPending}
                        className={`text-xs px-4 py-1.5 rounded-lg font-medium transition ${nextAction.cls} disabled:opacity-60`}>
                        {nextAction.label}
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => { if (confirm('Cancel this order?')) cancel.mutate(order.id) }}
                        disabled={cancel.isPending}
                        className="text-xs px-4 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition disabled:opacity-60">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </MerchantLayout>
  )
}