import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { merchantLogin } from '../../api/auth'

export default function MerchantLogin() {
  const [form, setForm] = useState({ phoneNumber: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
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
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} required
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPassword
                    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
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
