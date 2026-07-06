import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerLogin } from '../../api/auth'

export default function PhoneEntry() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('customerToken')) navigate('/shop')
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(phone)) { setError('Enter a valid 10-digit mobile number'); return }
    setLoading(true); setError('')
    try {
      const data = await customerLogin(phone)
      localStorage.setItem('customerToken', data.token)
      navigate('/shop')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-sm">
        <div className="hidden flex-1 flex-col justify-between bg-white/8 p-10 text-white lg:flex">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-indigo-100">
              Grand Fresh
            </span>
            <h1 className="mt-6 max-w-md text-5xl font-extrabold leading-tight">
              Fresh products at best prices, delivered to you
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-indigo-100">
              Shop daily essentials, fruits, vegetables and groceries from a store experience built for speed and trust.
            </p>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/10 p-6">
            {[
              'Best prices guaranteed',
              'Quick & easy checkout',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-base font-medium">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-white px-6 py-10 lg:max-w-md">
          <div className="w-full max-w-sm">
            <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-gray-100">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-3xl text-white shadow-lg">
                  🛍️
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                <p className="mt-2 text-sm text-gray-500">Enter your mobile number to start shopping with Grand Fresh</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Mobile Number</label>
                  <div className="flex overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                    <span className="inline-flex items-center bg-gray-50 px-4 text-sm font-medium text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="flex-1 px-4 py-3.5 text-sm outline-none"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-rose-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
                >
                  {loading ? 'Please wait…' : 'Continue →'}
                </button>
              </form>
            </div>

            <p className="mt-4 text-center text-sm font-medium text-gray-400">Trusted by 1000+ customers</p>
            <div className="mt-4 text-center">
              <a href="/merchant/login" className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800">Merchant Login →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}