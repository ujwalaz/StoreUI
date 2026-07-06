import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'

export default function CartSidebar({ onClose }) {
  const items = useCartStore(s => s.items)
  const updateQty = useCartStore(s => s.updateQty)
  const removeItem = useCartStore(s => s.removeItem)
  const getTotal = useCartStore(s => s.getTotal)
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
        <div>
          <h2 className="text-lg font-bold">Cart ({items.length})</h2>
          <p className="text-xs text-indigo-100">Review your selected products</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white">✕</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-gray-400">
          Your cart is empty
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 transition hover:bg-gray-50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold uppercase text-indigo-700">
                {item.name?.[0] || 'P'}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">₹{Number(item.sellingPrice).toFixed(2)} each</p>
              </div>

              <div className="flex items-center gap-1 rounded-xl border border-indigo-200 bg-white px-1.5 py-1">
                <button
                  onClick={() => updateQty(item.productId, item.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-600 transition hover:bg-indigo-100"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.maxQuantity}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <span className="block text-sm font-bold text-gray-800">
                  ₹{(Number(item.sellingPrice) * item.quantity).toFixed(2)}
                </span>
                <button onClick={() => removeItem(item.productId)} className="mt-1 text-xs font-medium text-rose-500 transition hover:text-rose-600">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="border-t border-gray-100 bg-indigo-50/60 p-4">
          {(() => {
            const totalMrp = items.reduce((sum, i) => sum + Number(i.mrp) * i.quantity, 0)
            const savings = totalMrp - getTotal()
            return savings > 0 ? (
              <div className="mb-3 space-y-1 rounded-2xl bg-white/80 p-3">
                <div className="flex justify-between text-sm text-gray-400 line-through">
                  <span>MRP Total</span>
                  <span>₹{totalMrp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-emerald-600">
                  <span>You save</span>
                  <span>−₹{savings.toFixed(2)}</span>
                </div>
              </div>
            ) : null
          })()}

          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => { navigate('/checkout'); onClose?.() }}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:from-indigo-700 hover:to-purple-700"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  )
}