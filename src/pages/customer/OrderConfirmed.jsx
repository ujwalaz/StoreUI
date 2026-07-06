import { useSearchParams, Link } from 'react-router-dom'

export default function OrderConfirmed() {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-indigo-50 p-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white bg-white p-10 text-center shadow-xl">
        <span className="absolute left-5 top-5 h-3 w-3 rounded-full bg-amber-400" />
        <span className="absolute right-6 top-8 h-4 w-4 rounded-full bg-rose-400" />
        <span className="absolute bottom-8 left-8 h-3.5 w-3.5 rounded-full bg-indigo-400" />
        <span className="absolute bottom-5 right-10 h-5 w-5 rounded-full bg-emerald-400" />

        <div className="mx-auto mb-5 flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-emerald-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-12 w-12 text-emerald-600">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="m5 12 4.5 4.5L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900">Order Placed Successfully!</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Thank you for shopping with Grand Fresh. Your order is confirmed and will be processed shortly.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
          Order ID #{orderId}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/shop"
            className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:from-indigo-700 hover:to-purple-700"
          >
            Continue Shopping
          </Link>
          <Link
            to="/my-orders"
            className="flex-1 rounded-2xl border border-indigo-200 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  )
}