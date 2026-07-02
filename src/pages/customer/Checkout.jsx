import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { placeOrder } from '../../api/orders'
import { decodeToken } from '../../utils/decodeToken'

export default function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore(s => s.items)
  const getTotal = useCartStore(s => s.getTotal)
  const clearCart = useCartStore(s => s.clearCart)

  const token = localStorage.getItem('customerToken')
  const decoded = decodeToken(token)
  const phone = decoded?.phone || ''

  const [form, setForm] = useState({ customerName: '', street: '', city: '', state: '', postalCode: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) { setError('Your cart is empty'); return }
    setLoading(true); setError('')
    try {
      const order = await placeOrder({
        customerName: form.customerName,
        address: { street: form.street, city: form.city, state: form.state, postalCode: form.postalCode },
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      })
      clearCart()
      navigate(`/order-confirmed?orderId=${order.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-700 text-lg">Delivery Details</h2>
            <div>
              <label className="label">Mobile</label>
              <p className="text-sm text-gray-600 bg-gray-100 px-4 py-2.5 rounded-xl">{phone}</p>
            </div>
            <Input label="Full Name" value={form.customerName} onChange={set('customerName')} required />
            <Input label="Street / House No." value={form.street} onChange={set('street')} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={form.city} onChange={set('city')} required />
              <Input label="State" value={form.state} onChange={set('state')} required />
            </div>
            <Input label="Pincode" value={form.postalCode} onChange={set('postalCode')} required maxLength={6} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
              {loading ? 'Placing Order…' : `Place Order • ₹${getTotal().toFixed(2)}`}
            </button>
          </form>

          {/* Summary */}
          <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="font-semibold text-gray-700 mb-3">Order Summary</h2>
            {items.length === 0 ? (
              <p className="text-gray-400 text-sm">Cart is empty</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {items.map(i => (
                  <li key={i.productId} className="flex justify-between text-gray-700">
                    <span>{i.name} × {i.quantity}</span>
                    <span className="font-medium">₹{(Number(i.sellingPrice) * i.quantity).toFixed(2)}</span>
                  </li>
                ))}
                {(() => {
                  const totalMrp = items.reduce((sum, i) => sum + Number(i.mrp) * i.quantity, 0)
                  const savings = totalMrp - getTotal()
                  return savings > 0 ? (
                    <>
                      <li className="border-t pt-2 flex justify-between text-gray-400 line-through text-xs">
                        <span>MRP Total</span>
                        <span>₹{totalMrp.toFixed(2)}</span>
                      </li>
                      <li className="flex justify-between text-green-600 font-medium">
                        <span>Total Savings</span>
                        <span>−₹{savings.toFixed(2)}</span>
                      </li>
                    </>
                  ) : null
                })()}
                <li className="border-t pt-2 flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{getTotal().toFixed(2)}</span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input {...props}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
    </div>
  )
}
