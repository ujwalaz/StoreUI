import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'

export default function CartSidebar({ onClose }) {
  const items = useCartStore(s => s.items)
  const updateQty = useCartStore(s => s.updateQty)
  const removeItem = useCartStore(s => s.removeItem)
  const getTotal = useCartStore(s => s.getTotal)
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-bold text-lg">Cart ({items.length})</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Your cart is empty</div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">₹{Number(item.sellingPrice).toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-1 border border-gray-200 rounded px-1">
                <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                  className="text-gray-600 px-1 font-bold">−</button>
                <span className="text-sm w-5 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.maxQuantity}
                  className="text-gray-600 px-1 font-bold disabled:text-gray-300">+</button>
              </div>
              <span className="text-sm font-semibold w-16 text-right">
                ₹{(Number(item.sellingPrice) * item.quantity).toFixed(2)}
              </span>
              <button onClick={() => removeItem(item.productId)}
                className="text-red-400 hover:text-red-600 ml-1">✕</button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          {(() => {
            const totalMrp = items.reduce((sum, i) => sum + Number(i.mrp) * i.quantity, 0)
            const savings = totalMrp - getTotal()
            return savings > 0 ? (
              <div className="mb-2 space-y-1">
                <div className="flex justify-between text-sm text-gray-400 line-through">
                  <span>MRP Total</span>
                  <span>₹{totalMrp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-green-600">
                  <span>You save</span>
                  <span>−₹{savings.toFixed(2)}</span>
                </div>
              </div>
            ) : null
          })()}
          <div className="flex justify-between font-bold text-base mb-3">
            <span>Total</span>
            <span>₹{getTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={() => { navigate('/checkout'); onClose?.() }}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  )
}
