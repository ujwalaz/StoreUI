import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCustomerProducts } from '../../api/products'
import { getMerchantInfo } from '../../api/merchant'
import { getCustomerCategories } from '../../api/categories'
import ProductCard from '../../components/ProductCard'
import CartSidebar from '../../components/CartSidebar'
import { useCartStore } from '../../store/cartStore'

export default function Shop() {
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const cartCount = useCartStore(s => s.items.reduce((n, i) => n + i.quantity, 0))

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getCustomerProducts
  })

  const { data: merchantInfo } = useQuery({
    queryKey: ['merchantInfo'],
    queryFn: getMerchantInfo
  })

  const { data: allCategories = [] } = useQuery({
    queryKey: ['customerCategories'],
    queryFn: getCustomerCategories
  })

  // Only show categories that have at least one product in the loaded list
  const activeCategoryIds = new Set(products.map(p => p.categoryId).filter(Boolean))
  const categories = allCategories.filter(c => activeCategoryIds.has(c.id))

  const filtered = products
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(p => selectedCategory == null || p.categoryId === selectedCategory)
    .sort((a, b) => {
      const aOut = (a.quantity ?? 0) <= 0
      const bOut = (b.quantity ?? 0) <= 0
      return aOut === bOut ? 0 : aOut ? 1 : -1
    })

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold">
                {merchantInfo?.businessName || 'Grand Fresh'}
              </h1>
              <p className="mt-1 text-sm text-indigo-100">{filtered.length} products available</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link to="/my-orders" className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10">
                My Orders
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="relative rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-md transition hover:shadow-lg"
              >
                🛒 Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 hidden sm:block">
            <input
              type="search"
              placeholder="Search fruits, vegetables, snacks and more..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/40 bg-white px-5 py-3 text-sm text-gray-700 shadow-sm outline-none transition focus:border-white focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        <div className="px-4 pb-4 sm:hidden">
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-full border border-white/40 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm outline-none transition focus:border-white focus:ring-2 focus:ring-white/50"
          />
        </div>

        {categories.length > 0 && (
          <div className="overflow-x-auto px-4 pb-3 scrollbar-none">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory == null
                    ? 'bg-white text-indigo-700 shadow'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                All
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === c.id
                      ? 'bg-white text-indigo-700 shadow'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="page-enter mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
        {loadingProducts ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md">
                <div className="h-44 animate-pulse bg-gray-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="h-9 w-full animate-pulse rounded-xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center text-gray-400 shadow-sm">
            {search ? 'No products match your search' : 'No products available'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>

      <footer className="mt-8 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">{merchantInfo?.businessName}</p>
          {merchantInfo?.phone && <p>📞 {merchantInfo.phone}</p>}
          <p className="mt-1 text-xs text-gray-400">Contact us for any queries</p>
        </div>
      </footer>

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="h-full w-80 bg-white shadow-2xl">
            <CartSidebar onClose={() => setCartOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}