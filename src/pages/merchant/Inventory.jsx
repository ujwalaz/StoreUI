import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MerchantLayout from '../../components/MerchantLayout'
import { getInventory, updateInventory } from '../../api/inventory'

export default function Inventory() {
  const qc = useQueryClient()
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory'], queryFn: getInventory
  })

  const update = useMutation({
    mutationFn: ({ productId, quantity }) => updateInventory(productId, quantity),
    onSuccess: () => qc.invalidateQueries(['inventory'])
  })

  const [qtyMap, setQtyMap] = useState({})

  const setQty = (id, val) => setQtyMap(m => ({ ...m, [id]: val }))
  const getQty = (item) => qtyMap[item.productId] ?? item.quantityOnHand

  const badge = (item) => {
    if (item.quantityOnHand === 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' }
    if (item.quantityOnHand <= item.lowStockThreshold) return { label: 'Low Stock', cls: 'bg-yellow-100 text-yellow-700' }
    return { label: 'In Stock', cls: 'bg-green-100 text-green-700' }
  }

  return (
    <MerchantLayout title="Inventory">
      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Product ID', 'Stock', 'Threshold', 'Status', 'Update'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventory.map(item => {
                const { label, cls } = badge(item)
                const isLow = item.quantityOnHand <= item.lowStockThreshold && item.quantityOnHand > 0
                return (
                  <tr key={item.productId} className={isLow ? 'bg-yellow-50/50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-800">#{item.productId}</td>
                    <td className="px-4 py-3">{item.quantityOnHand}</td>
                    <td className="px-4 py-3 text-gray-500">{item.lowStockThreshold}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input type="number" min="0" value={getQty(item)}
                          onChange={e => setQty(item.productId, Number(e.target.value))}
                          className="border border-gray-300 rounded-lg px-2 py-1 w-20 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                        <button
                          onClick={() => update.mutate({ productId: item.productId, quantity: getQty(item) })}
                          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                          Save
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
