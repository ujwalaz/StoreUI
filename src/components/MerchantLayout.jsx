import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import merchantApi from '../api/merchantApi'
import NotificationBell from './NotificationBell'

const getMerchantInfo = () => merchantApi.get('/api/merchant/info').then(r => r.data)

const NAV = [
  { to: '/merchant/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/merchant/products',  icon: '📦', label: 'Products' },
  { to: '/merchant/inventory', icon: '🗃️', label: 'Inventory' },
  { to: '/merchant/orders',    icon: '🛒', label: 'Orders' },
]

export default function MerchantLayout({ children, title }) {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768)
  const { data: merchantInfo } = useQuery({ queryKey: ['merchantInfo'], queryFn: getMerchantInfo })
  const logout = () => {
    localStorage.removeItem('merchantToken')
    navigate('/merchant/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`${collapsed ? 'w-14' : 'w-56'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shrink-0 h-screen sticky top-0`}>
        {/* Header */}
        <div className="px-3 py-4 border-b flex items-center justify-between gap-2 min-h-[57px]">
          {!collapsed && (
            <span className="font-bold text-indigo-700 text-base truncate">
              {merchantInfo?.businessName || 'Grand Fresh'}
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="ml-auto shrink-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg p-1.5 transition"
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  collapsed ? 'justify-center' : ''
                } ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <span className="text-base shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t">
          <button onClick={logout} title={collapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition ${collapsed ? 'justify-center' : ''}`}>
            <span className="shrink-0">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="font-bold text-xl text-gray-800">{title}</h1>
          <NotificationBell />
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
