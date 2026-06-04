import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantLogin } from '../../api/auth'

export default function MerchantLogin() {
  const [form, setForm] = useState({ phoneNumber: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(form.phoneNumber)) { setError('Enter a valid 10-digit mobile number'); return }
    setLoading(true); setError('')
    try {
      const data = await merchantLogin(form.phoneNumber, form.password)
      localStorage.setItem('merchantToken', data.token)
      navigate('/merchant/dashboard')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Form panel */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="text-3xl mb-2">🏪</div>
            <h1 className="text-2xl font-bold text-gray-800">Merchant Login</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to manage your store</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value.replace(/\D/g, '') }))}
                  required
                  placeholder="10-digit mobile number"
                  className="flex-1 border border-gray-300 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={set('password')} required
                placeholder="Password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-gray-400 hover:text-indigo-500">← Customer Shop</a>
          </div>
        </div>
      </div>
      {/* Brand panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center">
        <div className="text-white text-center px-12">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-3xl font-bold mb-3">Grand Fresh Manager</h2>
          <p className="text-indigo-200 text-lg">Manage products, inventory and orders from one place</p>
        </div>
      </div>
    </div>
  )
}
