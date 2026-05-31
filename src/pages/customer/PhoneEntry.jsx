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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🛍️</div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your mobile number to start shopping</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="flex-1 border border-gray-300 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
            {loading ? 'Please wait…' : 'Continue →'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/merchant/login" className="text-xs text-gray-400 hover:text-indigo-500">Merchant Login</a>
        </div>
      </div>
    </div>
  )
}
