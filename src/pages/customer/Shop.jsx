import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCustomerProducts } from '../../api/products'
import { getMerchantInfo } from '../../api/merchant'
import ProductCard from '../../components/ProductCard'
import CartSidebar from '../../components/CartSidebar'
import { useCartStore } from '../../store/cartStore'

export default function Shop() {
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')
  const cartCount = useCartStore(s => s.items.reduce((n, i) => n + i.quantity, 0))

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getCustomerProducts
  })

  const { data: merchantInfo } = useQuery({
    queryKey: ['merchantInfo'],
    queryFn: getMerchantInfo
  })

  const filtered = products
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aOut = (a.quantity ?? 0) <= 0
      const bOut = (b.quantity ?? 0) <= 0
      return aOut === bOut ? 0 : aOut ? 1 : -1
    })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <h1 className="font-bold text-lg text-indigo-700 shrink-0">
            {merchantInfo?.businessName || 'Grand Fresh'}
          </h1>
          {/* Search — hidden on mobile, visible on sm+ */}
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="hidden sm:block flex-1 min-w-0 border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/my-orders" className="text-sm text-gray-600 hover:text-indigo-600">My Orders</Link>
            <button onClick={() => setCartOpen(true)}
              className="relative bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Search — full width below header row, mobile only */}
        <div className="sm:hidden px-4 pb-3">
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </header>

      {/* Products */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1">
        {loadingProducts ? (
          <div className="text-center py-20 text-gray-400">Loading products…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {search ? 'No products match your search' : 'No products available'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">{merchantInfo?.businessName}</p>
          {merchantInfo?.phone && <p>📞 {merchantInfo.phone}</p>}
          <p className="mt-1 text-xs text-gray-400">Contact us for any queries</p>
        </div>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="w-80 bg-white shadow-xl h-full flex flex-col">
            <CartSidebar onClose={() => setCartOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
