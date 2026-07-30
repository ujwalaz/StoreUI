import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  const [form, setForm] = useState({ customerName: '', street: '', city: '', postalCode: '' })
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
        address: { street: form.street, city: form.city, postalCode: form.postalCode },
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
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-700">
          <span>←</span>
          <span>Back to Shop</span>
        </Link>

        <div className="mt-4 mb-8">
          <h1 className="bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent">
            Secure Checkout
          </h1>
          <p className="mt-2 text-sm text-gray-500">Complete your delivery details and review your order before placing it.</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <form onSubmit={handleSubmit} className="flex-1 space-y-5">
            <SectionCard step="1" title="Contact Details" subtitle="We&apos;ll use this information to confirm your order.">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Mobile</label>
                <p className="rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-600 shadow-sm">{phone}</p>
              </div>
              <Input label="Full Name" value={form.customerName} onChange={set('customerName')} required />
            </SectionCard>

            <SectionCard step="2" title="Delivery Details" subtitle="Enter the address where you want your order delivered.">
              <Input label="Street / House No." value={form.street} onChange={set('street')} required />
              <Input label="City" value={form.city} onChange={set('city')} required />
              <Input label="Pincode" value={form.postalCode} onChange={set('postalCode')} required maxLength={6} />
              {error && <p className="text-sm text-rose-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
              >
                {loading && (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                <span>{loading ? 'Placing your order...' : `Place Order • ₹${getTotal().toFixed(2)}`}</span>
              </button>
            </SectionCard>
          </form>

          <div className="w-full lg:w-96">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                <h2 className="font-semibold text-gray-800">Order Summary</h2>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {items.length} item{items.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="p-5">
                {items.length === 0 ? (
                  <p className="text-sm text-gray-400">Cart is empty</p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {items.map(i => (
                      <li key={i.productId} className="flex justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-gray-700">
                        <span>{i.name} × {i.quantity}</span>
                        <span className="font-semibold">₹{(Number(i.sellingPrice) * i.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                    {(() => {
                      const totalMrp = items.reduce((sum, i) => sum + Number(i.mrp) * i.quantity, 0)
                      const savings = totalMrp - getTotal()
                      return savings > 0 ? (
                        <>
                          <li className="flex justify-between border-t border-dashed border-gray-200 pt-3 text-xs text-gray-400 line-through">
                            <span>MRP Total</span>
                            <span>₹{totalMrp.toFixed(2)}</span>
                          </li>
                          <li className="flex justify-between font-medium text-emerald-600">
                            <span>Total Savings</span>
                            <span>−₹{savings.toFixed(2)}</span>
                          </li>
                        </>
                      ) : null
                    })()}
                    <li className="flex justify-between border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{getTotal().toFixed(2)}</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionCard({ step, title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md">
          {step}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        {...props}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  )
}
