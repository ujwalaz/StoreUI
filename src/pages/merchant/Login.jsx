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
    <div className="min-h-screen bg-slate-100 lg:flex">
      <div className="flex w-full items-center justify-center bg-white px-8 py-10 lg:w-2/5">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl text-white shadow-lg">
              🏪
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Merchant Login</h1>
            <p className="mt-2 text-sm text-gray-500">Sign in to manage products, inventory and orders for your store.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone Number</label>
              <div className="flex overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="inline-flex items-center border-l-4 border-transparent bg-gray-50 px-4 text-sm font-medium text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value.replace(/\D/g, '') }))}
                  required
                  placeholder="10-digit mobile number"
                  className="flex-1 border-l-4 border-transparent px-4 py-3.5 text-sm outline-none transition focus:border-l-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  placeholder="Password"
                  className="w-full border-l-4 border-transparent px-4 py-3.5 pr-11 text-sm outline-none transition focus:border-l-indigo-500"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPassword
                    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-rose-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-400 transition hover:text-indigo-500">← Customer Shop</a>
          </div>
        </div>
      </div>

      <div className="relative hidden flex-1 overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 lg:flex">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="relative flex w-full flex-col justify-between px-14 py-12 text-white">
          <div>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-indigo-100">Store management suite</span>
            <h2 className="mt-6 max-w-xl text-4xl font-extrabold leading-tight">Everything you need to run Grand Fresh like a modern retail business.</h2>
            <div className="mt-8 space-y-4 text-indigo-100">
              {[
                'Track stock levels and low inventory alerts in real time',
                'Manage product pricing, images and catalogue updates',
                'Process customer orders with a clean operational dashboard',
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid max-w-xl grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="mb-4 h-3 w-20 rounded-full bg-white/30" />
              <div className="space-y-3">
                <div className="h-20 rounded-2xl bg-gradient-to-r from-emerald-400/60 to-indigo-300/40" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-14 rounded-2xl bg-white/15" />
                  <div className="h-14 rounded-2xl bg-white/15" />
                </div>
              </div>
            </div>
            <div className="translate-y-8 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-3 w-16 rounded-full bg-white/30" />
                <div className="h-8 w-8 rounded-xl bg-amber-400/70" />
              </div>
              <div className="space-y-3">
                <div className="h-12 rounded-2xl bg-white/15" />
                <div className="h-12 rounded-2xl bg-white/15" />
                <div className="h-24 rounded-2xl bg-gradient-to-br from-purple-400/60 to-indigo-300/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}