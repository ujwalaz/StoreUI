import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(persist(
  (set, get) => ({
    items: [],

    addItem: (product) => {
      const items = get().items
      const existing = items.find(i => i.productId === product.id)
      if (existing) {
        if (existing.quantity >= existing.maxQuantity) return
        set({ items: items.map(i => i.productId === product.id
          ? { ...i, quantity: i.quantity + 1 } : i) })
      } else {
        set({ items: [...items, {
          productId: product.id,
          name: product.name,
          sellingPrice: product.sellingPrice,
          mrp: product.mrp,
          imageUrl: product.imageUrl,
          quantity: 1,
          maxQuantity: product.quantity ?? 999
        }] })
      }
    },

    removeItem: (productId) =>
      set({ items: get().items.filter(i => i.productId !== productId) }),

    updateQty: (productId, qty) => {
      if (qty <= 0) {
        set({ items: get().items.filter(i => i.productId !== productId) })
      } else {
        set({ items: get().items.map(i => i.productId === productId
          ? { ...i, quantity: Math.min(qty, i.maxQuantity) } : i) })
      }
    },

    clearCart: () => set({ items: [] }),

    getTotal: () => get().items.reduce(
      (sum, i) => sum + Number(i.sellingPrice) * i.quantity, 0
    )
  }),
  { name: 'cart-storage' }
))
