import customerApi from './customerApi'
import merchantApi from './merchantApi'

export const getCustomerProducts = () =>
  customerApi.get('/api/products').then(r => Array.isArray(r.data) ? r.data : [])

export const getMerchantProducts = () =>
  merchantApi.get('/api/products').then(r => Array.isArray(r.data) ? r.data : [])

export const createProduct = (data) =>
  merchantApi.post('/api/products', data).then(r => r.data)

export const updateProduct = (id, data) =>
  merchantApi.put(`/api/products/${id}`, data).then(r => r.data)

export const deleteProduct = (id) =>
  merchantApi.delete(`/api/products/${id}`)
