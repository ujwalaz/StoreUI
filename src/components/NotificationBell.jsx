import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMerchantOrders } from '../api/orders'
import { getInventory } from '../api/inventory'

const SEEN_KEY = 'merchant_seen_notifications'

function getSeenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')) } catch { return new Set() }
}
function saveSeenIds(set) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...set]))
}

export default function NotificationBell() {
  const { data: orders = [] } = useQuery({
    queryKey: ['mOrders'],
    queryFn: () => getMerchantOrders(),
    refetchInterval: 30_000,
  })
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventory,
    refetchInterval: 30_000,
  })

  const [open, setOpen] = useState(false)
  const [seenIds, setSeenIds] = useState(getSeenIds)
  const ref = useRef()

  // When a product comes back in stock, remove it from seenIds so
  // it will show as NEW again if it goes OOS in the future.
  useEffect(() => {
    if (!inventory.length) return
    const restockedOosIds = [...seenIds].filter(id => {
      if (!id.startsWith('oos_')) return false
      const productId = Number(id.replace('oos_', ''))
      const item = inventory.find(i => i.productId === productId)
      return item && item.quantityOnHand > 0
    })
    if (restockedOosIds.length > 0) {
      const next = new Set(seenIds)
      restockedOosIds.forEach(id => next.delete(id))
      setSeenIds(next)
      saveSeenIds(next)
    }
  }, [inventory])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const allNotifications = [
    ...orders
      .filter(o => o.status === 'pending')
      .map(o => ({
        id: `order_${o.id}`,
        type: 'order',
        message: `New order #${o.id}${o.customerName ? ` from ${o.customerName}` : ''}`,
        to: '/merchant/orders',
      })),
    ...inventory
      .filter(i => i.quantityOnHand === 0)
      .map(i => ({
        id: `oos_${i.productId}`,
        type: 'stock',
        message: `${i.productName || `Product #${i.productId}`} is out of stock`,
        to: '/merchant/inventory',
      })),
  ]

  // Only show unread notifications in the dropdown.
  // Acknowledged notifications are hidden until the underlying state changes.
  const unread = allNotifications.filter(n => !seenIds.has(n.id))

  const markAllRead = () => {
    const next = new Set([...seenIds, ...allNotifications.map(n => n.id)])
    setSeenIds(next)
    saveSeenIds(next)
  }

  const handleNotificationClick = () => {
    markAllRead()
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Notifications"
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread.length > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-gray-800 text-sm">
              Notifications
              {unread.length > 0 && (
                <span className="ml-1 text-xs text-indigo-600 font-normal">({unread.length} new)</span>
              )}
            </span>
            {unread.length > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {unread.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">All caught up! 🎉</p>
            ) : (
              unread.map(n => (
                <Link
                  key={n.id}
                  to={n.to}
                  onClick={handleNotificationClick}
                  className="flex items-start gap-3 px-4 py-3 bg-indigo-50/60 hover:bg-indigo-50 transition"
                >
                  <span className="text-lg shrink-0 mt-0.5">{n.type === 'order' ? '🛒' : '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                    <span className="inline-block mt-0.5 text-[10px] text-white bg-indigo-500 font-semibold px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
