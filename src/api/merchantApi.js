import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const merchantApi = axios.create({ baseURL: BASE_URL })

merchantApi.interceptors.request.use(config => {
  const token = localStorage.getItem('merchantToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

merchantApi.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    if (status === 401 || status === 403) {
      const currentPath = window.location.pathname
      if (currentPath !== '/merchant/login') {
        localStorage.removeItem('merchantToken')
        window.location.href = '/merchant/login'
      }
    }
    return Promise.reject(err)
  }
)

export default merchantApi
