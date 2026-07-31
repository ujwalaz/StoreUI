import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import merchantApi from '../api/merchantApi'
import NotificationBell from './NotificationBell'
import { useLanguageStore } from '../store/languageStore'
import { useT } from '../i18n/useT'

const getMerchantInfo = () => merchantApi.get('/api/merchant/info').then(r => r.data)

const NAV = [
  { to: '/merchant/dashboard', labelKey: 'nav.dashboard', icon: ChartIcon },
  { to: '/merchant/products', labelKey: 'nav.products', icon: CubeIcon },
  { to: '/merchant/inventory', labelKey: 'nav.inventory', icon: ClipboardIcon },
  { to: '/merchant/orders', labelKey: 'nav.orders', icon: BagIcon },
]

export default function MerchantLayout({ children, title }) {
  const navigate = useNavigate()
  const t = useT()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: merchantInfo } = useQuery({ queryKey: ['merchantInfo'], queryFn: getMerchantInfo })
  const logout = () => {
    localStorage.removeItem('merchantToken')
    navigate('/merchant/login')
  }

  const sidebarContent = (onNavClick) => (
    <>
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-5 text-white">
        <div className="flex items-start justify-between gap-3">
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-100">{t('layout.brand')}</p>
              <p className="mt-1 truncate text-lg font-bold">
                {merchantInfo?.businessName || t('layout.merchantPanel')}
              </p>
            </div>
          )}
          {/* Desktop collapse/expand button — hidden on mobile */}
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? t('layout.expandSidebar') : t('layout.collapseSidebar')}
            className="ml-auto hidden shrink-0 rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 md:flex"
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto shrink-0 rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 md:hidden"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            title={collapsed ? t(labelKey) : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                collapsed ? 'md:justify-center' : ''
              } ${isActive ? 'bg-indigo-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800'}`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {/* Always show label on mobile drawer; respect collapsed on desktop */}
            <span className={collapsed ? 'md:hidden' : ''}>{t(labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={logout}
          title={collapsed ? t('layout.logout') : undefined}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-red-400 transition hover:bg-gray-800 ${collapsed ? 'md:justify-center' : ''}`}
        >
          <LogoutIcon className="h-5 w-5 shrink-0" />
          <span className={collapsed ? 'md:hidden' : ''}>{t('layout.logout')}</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gray-900 text-gray-200 transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent(() => setMobileOpen(false))}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-72'} sticky top-0 hidden h-screen shrink-0 flex-col bg-gray-900 text-gray-200 transition-all duration-300 md:flex`}>
        {sidebarContent(undefined)}
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="relative border-b border-gray-200 bg-white px-4 py-4 shadow-sm md:px-6">
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen(true)}
                className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
                aria-label="Open menu"
              >
                <HamburgerIcon />
              </button>
              <div className="min-w-0">
                <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 sm:block">{t('layout.breadcrumb', { title })}</p>
                <h1 className="truncate text-lg font-bold text-gray-800 md:text-2xl">{title}</h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              {!collapsed && (
                <div className="hidden rounded-2xl border border-gray-200 bg-slate-50 px-4 py-2 text-right lg:block">
                  <p className="text-xs text-gray-500">{t('layout.signedInAs')}</p>
                  <p className="text-sm font-semibold text-gray-700">{merchantInfo?.businessName || t('layout.brand')}</p>
                </div>
              )}
              <LanguageToggle />
              <NotificationBell />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}

function LanguageToggle() {
  const { lang, setLang } = useLanguageStore()
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
      title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
    >
      {lang === 'en' ? '🇮🇳 हिंदी' : '🔤 English'}
    </button>
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

function HamburgerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}
