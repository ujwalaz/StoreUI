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
    { label: 'Active Products', value: products.length, to: '/merchant/products', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Low Stock Items', value: lowStock.length, to: '/merchant/inventory?status=low', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Out of Stock', value: outOfStock, to: '/merchant/inventory?status=out', color: 'bg-red-50 text-red-700' },
    { label: 'Pending Orders', value: pending, to: '/merchant/orders?tab=Pending', color: 'bg-orange-50 text-orange-700' },
    { label: 'Total Orders', value: orders.length, to: '/merchant/orders', color: 'bg-green-50 text-green-700' },
  ]

  return (
    <MerchantLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {tiles.map(t => (
          <Link key={t.label} to={t.to}
            className={`${t.color} rounded-2xl p-5 flex flex-col gap-1 hover:shadow-md transition`}>
            <span className="text-3xl font-bold">{t.value}</span>
            <span className="text-sm font-medium">{t.label}</span>
          </Link>
        ))}
      </div>
    </MerchantLayout>
  )
}
