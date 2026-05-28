import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import CustomerRoute from './components/CustomerRoute'
import MerchantRoute from './components/MerchantRoute'

import PhoneEntry from './pages/customer/PhoneEntry'
import Shop from './pages/customer/Shop'
import Checkout from './pages/customer/Checkout'
import OrderConfirmed from './pages/customer/OrderConfirmed'
import MyOrders from './pages/customer/MyOrders'

import MerchantLogin from './pages/merchant/Login'
import Dashboard from './pages/merchant/Dashboard'
import Products from './pages/merchant/Products'
import Inventory from './pages/merchant/Inventory'
import Orders from './pages/merchant/Orders'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer */}
        <Route path="/" element={<PhoneEntry />} />
        <Route path="/shop" element={<CustomerRoute><Shop /></CustomerRoute>} />
        <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
        <Route path="/order-confirmed" element={<CustomerRoute><OrderConfirmed /></CustomerRoute>} />
        <Route path="/my-orders" element={<CustomerRoute><MyOrders /></CustomerRoute>} />

        {/* Merchant */}
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/merchant/dashboard" element={<MerchantRoute><Dashboard /></MerchantRoute>} />
        <Route path="/merchant/products" element={<MerchantRoute><Products /></MerchantRoute>} />
        <Route path="/merchant/inventory" element={<MerchantRoute><Inventory /></MerchantRoute>} />
        <Route path="/merchant/orders" element={<MerchantRoute><Orders /></MerchantRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
