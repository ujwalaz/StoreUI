import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import MerchantLayout from '../../components/MerchantLayout'
import { getMerchantProducts } from '../../api/products'
import { getInventory, getLowStock } from '../../api/inventory'
import { getMerchantOrders } from '../../api/orders'

export default function Dashboard() {
  const { data: products = [], isError: prodErr } = useQuery({ queryKey: ['mProducts'], queryFn: getMerchantProducts })
  const { data: inventory = [] } = useQuery({ queryKey: ['inventory'], queryFn: getInventory })
  const { data: lowStock = [] } = useQuery({ queryKey: ['lowStock'], queryFn: getLowStock })
  const { data: orders = [], isError: ordErr } = useQuery({ queryKey: ['mOrders'], queryFn: () => getMerchantOrders() })

  const outOfStock = inventory.filter(i => i.quantityOnHand === 0).length
  const pending = orders.filter(o => o.status === 'pending').length

  const tiles = [
    {
      label: 'Active Products',
      value: products.length,
      to: '/merchant/products',
      trend: `${prodErr ? 'Data unavailable' : 'Catalog ready for sale'}`,
      accent: 'from-indigo-500 to-indigo-600',
      icon: CubeIcon,
    },
    {
      label: 'Low Stock Items',
      value: lowStock.length,
      to: '/merchant/inventory?status=low',
      trend: `${lowStock.length} need restock soon`,
      accent: 'from-amber-400 to-orange-500',
      icon: AlertIcon,
    },
    {
      label: 'Out of Stock',
      value: outOfStock,
      to: '/merchant/inventory?status=out',
      trend: `${outOfStock} unavailable right now`,
      accent: 'from-rose-400 to-rose-500',
      icon: BoxOffIcon,
    },
    {
      label: 'Pending Orders',
      value: pending,
      to: '/merchant/orders?tab=Pending',
      trend: `${pending} orders awaiting action`,
      accent: 'from-purple-500 to-fuchsia-500',
      icon: BagIcon,
    },
    {
      label: 'Total Orders',
      value: orders.length,
      to: '/merchant/orders',
      trend: `${ordErr ? 'Data unavailable' : 'Overall store demand'}`,
      accent: 'from-emerald-500 to-teal-500',
      icon: ChartIcon,
    },
  ]

  const actions = [
    { label: 'Add Product', to: '/merchant/products', tone: 'bg-indigo-600 text-white hover:bg-indigo-700' },
    { label: 'Update Inventory', to: '/merchant/inventory', tone: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50' },
    { label: 'View Pending Orders', to: '/merchant/orders?tab=Pending', tone: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50' },
  ]

  return (
    <MerchantLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {tiles.map(tile => {
          const Icon = tile.icon
          return (
            <Link
              key={tile.label}
              to={tile.to}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tile.accent} text-white shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Live</span>
              </div>
              <p className="text-sm font-medium text-gray-500">{tile.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{tile.value}</p>
              <p className="mt-3 text-sm text-gray-500">{tile.trend}</p>
              <span className="mt-5 inline-flex items-center text-sm font-semibold text-indigo-600">
                View all →
              </span>
            </Link>
          )
        })}
      </div>

      <section className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">Jump straight into the tasks that keep your store running smoothly.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {actions.map(action => (
            <Link
              key={action.label}
              to={action.to}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all hover:shadow-md ${action.tone}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </MerchantLayout>
  )
}

function iconProps(className) {
  return { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', className }
}

function CubeIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m12 3 8 4.5-8 4.5-8-4.5L12 3Zm8 4.5V16.5L12 21l-8-4.5V7.5M12 12v9" />
    </svg>
  )
}

function AlertIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v4m0 4h.01M10.3 3.8 2.8 17a1.5 1.5 0 0 0 1.3 2.2h15.8a1.5 1.5 0 0 0 1.3-2.2L13.7 3.8a1.5 1.5 0 0 0-3.4 0Z" />
    </svg>
  )
}

function BoxOffIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m4 4 16 16M12 3l8 4.5-3.4 1.9M12 3 6 6.4m6 5.6v9m8-13.5V16.5L12 21l-8-4.5V7.5l2.6-1.5" />
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

function ChartIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 19h16M7 16V9m5 7V5m5 11v-4" />
    </svg>
  )
}