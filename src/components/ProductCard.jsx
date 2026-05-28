import { useCartStore } from '../store/cartStore'

export default function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem)
  const items = useCartStore(s => s.items)
  const inCart = items.find(i => i.productId === product.id)
  const outOfStock = !product.quantity || product.quantity === 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name}
          className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          No Image
        </div>
      )}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-base font-bold text-gray-900">₹{Number(product.sellingPrice).toFixed(2)}</span>
          {Number(product.sellingPrice) < Number(product.mrp) && (
            <span className="text-xs text-gray-400 line-through">₹{Number(product.mrp).toFixed(2)}</span>
          )}
        </div>
        <div className="mt-1">
          {outOfStock ? (
            <span className="text-xs text-red-500 font-medium">Out of Stock</span>
          ) : product.quantity <= 5 ? (
            <span className="text-xs text-orange-500 font-medium">Only {product.quantity} left</span>
          ) : (
            <span className="text-xs text-green-600 font-medium">In Stock</span>
          )}
        </div>
        <div className="mt-auto pt-2">
          {inCart ? (
            <div className="flex items-center gap-2">
              <QtyControl product={product} inCart={inCart} />
            </div>
          ) : (
            <button
              disabled={outOfStock}
              onClick={() => addItem(product)}
              className="w-full py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function QtyControl({ product, inCart }) {
  const updateQty = useCartStore(s => s.updateQty)
  return (
    <div className="flex items-center gap-2 w-full justify-between border border-indigo-200 rounded-lg px-2 py-1">
      <button onClick={() => updateQty(product.id, inCart.quantity - 1)}
        className="text-indigo-600 font-bold text-lg w-6 h-6 flex items-center justify-center">−</button>
      <span className="text-sm font-semibold">{inCart.quantity}</span>
      <button onClick={() => updateQty(product.id, inCart.quantity + 1)}
        disabled={inCart.quantity >= inCart.maxQuantity}
        className="text-indigo-600 font-bold text-lg w-6 h-6 flex items-center justify-center disabled:text-gray-300">+</button>
    </div>
  )
}
