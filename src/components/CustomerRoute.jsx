import { Navigate } from 'react-router-dom'

export default function CustomerRoute({ children }) {
  const token = localStorage.getItem('customerToken')
  return token ? children : <Navigate to="/" replace />
}
