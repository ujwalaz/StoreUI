import { Navigate } from 'react-router-dom'

export default function MerchantRoute({ children }) {
  const token = localStorage.getItem('merchantToken')
  return token ? children : <Navigate to="/merchant/login" replace />
}
