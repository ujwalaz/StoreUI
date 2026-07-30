import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MerchantLayout from '../../components/MerchantLayout'
import { getInventory, updateInventory } from '../../api/inventory'
import { useT } from '../../i18n/useT'

export default function Inventory() {
  const t = useT()
  const qc = useQueryClient()
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory'], queryFn: getInventory
  })

  const update = useMutation({
    mutationFn: ({ productId, quantity }) => updateInventory(productId, quantity),
    onSuccess: () => qc.invalidateQueries(['inventory'])
  })

  const [searchParams] = useSearchParams()
  const [qtyMap, setQtyMap] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all')

  const setQty = (id, val) => setQtyMap(m => ({ ...m, [id]: Math.max(0, val) }))
  const getQty = (item) => qtyMap[item.productId] ?? item.quantityOnHand

  const getStatus = (item) => {
    if (item.quantityOnHand === 0) return 'out'
    if (item.quantityOnHand <= item.lowStockThreshold) return 'low'
    return 'in'
  }

  const filtered = inventory.filter(item => {
    const matchesName = (item.productName || '').toLowerCase().includes(search.toLowerCase())
    const status = getStatus(item)
    const matchesStatus = statusFilter === 'all' || statusFilter === status
    return matchesName && matchesStatus
  })

  const lowStockCount = inventory.filter(item => getStatus(item) === 'low').length
  const outOfStockCount = inventory.filter(item => getStatus(item) === 'out').length

  const badge = (item) => {
    const status = getStatus(item)
    if (status === 'out') return { label: t('inv.badgeOut'), cls: 'bg-rose-100 text-rose-700' }
    if (status === 'low') return { label: t('inv.badgeLow'), cls: 'bg-amber-100 text-amber-700' }
    return { label: t('inv.badgeIn'), cls: 'bg-emerald-100 text-emerald-700' }
  }

  return (
    <MerchantLayout title={t('nav.inventory')}>
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard label={t('inv.totalProducts')} value={inventory.length} tone="from-indigo-500 to-purple-500" />
        <SummaryCard label={t('inv.lowStockCount')} value={lowStockCount} tone="from-amber-400 to-orange-500" />
        <SummaryCard label={t('inv.outOfStock')} value={outOfStockCount} tone="from-rose-400 to-rose-500" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder={t('inv.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-72 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="all">{t('inv.filterAll')}</option>
          <option value="in">{t('inv.filterIn')}</option>
          <option value="low">{t('inv.filterLow')}</option>
          <option value="out">{t('inv.filterOut')}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">{t('inv.loading')}</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                {[t('inv.colProduct'), t('inv.colStock'), t('inv.colThreshold'), t('inv.colStatus'), t('inv.colUpdate')].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => {
                const { label, cls } = badge(item)
                const isLow = item.quantityOnHand <= item.lowStockThreshold && item.quantityOnHand > 0
                return (
                  <tr key={item.productId} className={`${isLow ? 'bg-amber-50/40' : 'bg-white'} hover:bg-gray-50`}>
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {item.productName || `Product #${item.productId}`}
                    </td>
                    <td className="px-4 py-4 text-gray-700">{item.quantityOnHand}</td>
                    <td className="px-4 py-4 text-gray-500">{item.lowStockThreshold}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                          <button
                            type="button"
                            onClick={() => setQty(item.productId, getQty(item) - 1)}
                            className="px-3 py-2 text-indigo-600 transition hover:bg-indigo-50"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={getQty(item)}
                            onChange={e => setQty(item.productId, Number(e.target.value))}
                            className="w-20 border-x border-gray-200 px-2 py-2 text-center text-sm outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setQty(item.productId, getQty(item) + 1)}
                            className="px-3 py-2 text-indigo-600 transition hover:bg-indigo-50"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => update.mutate({ productId: item.productId, quantity: getQty(item) })}
                          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                        >
                          {t('inv.save')}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </MerchantLayout>
  )
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white ${tone}`}>
        {label}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}