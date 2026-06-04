import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import merchantApi from '../api/merchantApi'

const getMerchantInfo = () => merchantApi.get('/api/merchant/info').then(r => r.data)

const NAV = [
  { to: '/merchant/dashboard', label: '📊 Dashboard' },
  { to: '/merchant/products',  label: '📦 Products' },
  { to: '/merchant/inventory', label: '🗃️ Inventory' },
  { to: '/merchant/orders',    label: '🛒 Orders' },
]

export default function MerchantLayout({ children, title }) {
  const navigate = useNavigate()
  const { data: merchantInfo } = useQuery({ queryKey: ['merchantInfo'], queryFn: getMerchantInfo })
  const logout = () => {
    localStorage.removeItem('merchantToken')
    navigate('/merchant/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-4 border-b font-bold text-indigo-700 text-xl">{merchantInfo?.businessName || 'Grand Fresh'}</div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >{label}</NavLink>
          ))}
        </nav>
        <div className="p-3 border-t">
          <button onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition">
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-4">
          <h1 className="font-bold text-xl text-gray-800">{title}</h1>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
