import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import merchantApi from '../api/merchantApi'
import NotificationBell from './NotificationBell'

const getMerchantInfo = () => merchantApi.get('/api/merchant/info').then(r => r.data)

const NAV = [
  { to: '/merchant/dashboard', label: 'Dashboard', icon: ChartIcon },
  { to: '/merchant/products', label: 'Products', icon: CubeIcon },
  { to: '/merchant/inventory', label: 'Inventory', icon: ClipboardIcon },
  { to: '/merchant/orders', label: 'Orders', icon: BagIcon },
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
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`${collapsed ? 'w-20' : 'w-72'} sticky top-0 flex h-screen shrink-0 flex-col bg-gray-900 text-gray-200 transition-all duration-300`}>
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-100">Grand Fresh</p>
                <p className="mt-1 truncate text-lg font-bold">
                  {merchantInfo?.businessName || 'Merchant Panel'}
                </p>
              </div>
            )}
            <button
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="ml-auto shrink-0 rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  collapsed ? 'justify-center' : ''
                } ${isActive ? 'bg-indigo-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-red-400 transition hover:bg-gray-800 ${collapsed ? 'justify-center' : ''}`}
          >
            <LogoutIcon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="relative border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-transparent" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Merchant / {title}</p>
              <h1 className="mt-1 text-2xl font-bold text-gray-800">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              {!collapsed && (
                <div className="hidden rounded-2xl border border-gray-200 bg-slate-50 px-4 py-2 text-right lg:block">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-700">{merchantInfo?.businessName || 'Grand Fresh'}</p>
                </div>
              )}
              <NotificationBell />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  )
}

function iconProps(className) {
  return { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', className }
}

function ChartIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 19h16M7 16V9m5 7V5m5 11v-4" />
    </svg>
  )
}

function CubeIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m12 3 8 4.5-8 4.5-8-4.5L12 3Zm8 4.5V16.5L12 21l-8-4.5V7.5M12 12v9" />
    </svg>
  )
}

function ClipboardIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5.5h6M9.75 3h4.5A1.75 1.75 0 0 1 16 4.75V6H8V4.75A1.75 1.75 0 0 1 9.75 3ZM7 6h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2.5 4H15m-5.5 4H15" />
    </svg>
  )
}

function BagIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 9h12l-1 10H7L6 9Zm3-1V7a3 3 0 1 1 6 0v1" />
    </svg>
  )
}

function LogoutIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 17l5-5-5-5M15 12H4m0-7h5a2 2 0 0 1 2 2v1m0 8v1a2 2 0 0 1-2 2H4" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg {...iconProps('h-4 w-4')}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg {...iconProps('h-4 w-4')}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 18 6-6-6-6" />
    </svg>
  )
}