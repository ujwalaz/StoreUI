import { useState } from 'react'
import { useCartStore } from '../store/cartStore'

function getUnitLabel(product) {
  const { measurementUnit: u, unitSize: s } = product
  if (u === 'gm') return s ? `${s} gm` : 'gm'
  if (u === 'ltr') return s ? `${s} ml` : 'ltr'
  if (u === 'kg') return 'per kg'
  if (u === 'unit') return 'per unit'
  return u || ''
}

export default function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem)
  const items = useCartStore(s => s.items)
  const inCart = items.find(i => i.productId === product.id)
  const outOfStock = !product.quantity || product.quantity === 0
  const mrp = Number(product.mrp)
  const sellingPrice = Number(product.sellingPrice)
  const discountPercent = mrp > 0 && sellingPrice < mrp
    ? Math.round(((mrp - sellingPrice) / mrp) * 100)
    : 0

  const images = [product.imageUrl, product.imageUrlBack].filter(Boolean)
  const [imgIndex, setImgIndex] = useState(0)

  const prevImg = (e) => { e.stopPropagation(); setImgIndex(i => (i - 1 + images.length) % images.length) }
  const nextImg = (e) => { e.stopPropagation(); setImgIndex(i => (i + 1) % images.length) }

  return (
    <div className="group flex h-full flex-col overflow-hidden border border-gray-100 bg-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg">
      <div className="relative overflow-hidden">
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {images.length > 0 ? (
          <>
            <img
              src={images[imgIndex]}
              alt={`${product.name} ${imgIndex + 1}`}
              className="h-44 w-full object-cover transition-all duration-300 group-hover:scale-105"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition"
                  aria-label="Next image"
                >
                  ›
                </button>
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setImgIndex(idx) }}
                      className={`h-1.5 rounded-full transition-all ${idx === imgIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/50'}`}
                      aria-label={`Image ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-14 w-14 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M16 10a4 4 0 10-8 0m-2.5 1.5h13l-1 8.5a1 1 0 01-1 .9H7a1 1 0 01-1-.9l-1-8.5z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">{product.name}</h3>
        {product.measurementUnit && (
          <p className="text-xs text-gray-400">{getUnitLabel(product)}</p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-indigo-700">₹{sellingPrice.toFixed(2)}</span>
          {sellingPrice < mrp && (
            <span className="text-xs text-gray-400 line-through">₹{mrp.toFixed(2)}</span>
          )}
        </div>

        <div>
          {outOfStock ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-500">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Out of Stock
            </span>
          ) : product.quantity <= 5 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Only {product.quantity} left
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-1">
          {inCart ? (
            <QtyControl product={product} inCart={inCart} />
          ) : (
            <button
              disabled={outOfStock}
              onClick={() => addItem(product)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-2 text-sm font-semibold text-white transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
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
    <div className="flex w-full items-center justify-between border border-indigo-200 bg-indigo-50/60 px-2 py-1.5">
      <button
        onClick={() => updateQty(product.id, inCart.quantity - 1)}
        className="flex h-8 w-8 items-center justify-center bg-white text-xl font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-100"
      >
        −
      </button>
      <span className="text-sm font-semibold text-gray-800">{inCart.quantity}</span>
      <button
        onClick={() => updateQty(product.id, inCart.quantity + 1)}
        disabled={inCart.quantity >= inCart.maxQuantity}
        className="flex h-8 w-8 items-center justify-center bg-white text-xl font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:text-gray-300"
      >
        +
      </button>
    </div>
  )
}