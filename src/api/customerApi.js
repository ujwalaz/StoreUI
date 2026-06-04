import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const customerApi = axios.create({ baseURL: BASE_URL })

customerApi.interceptors.request.use(config => {
  const token = localStorage.getItem('customerToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

customerApi.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    if (status === 401 || status === 403) {
      const currentPath = window.location.pathname
      if (currentPath !== '/') {
        localStorage.removeItem('customerToken')
        localStorage.removeItem('cart-storage')
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

export default customerApi
