import customerApi from './customerApi'
import merchantApi from './merchantApi'

export const getCustomerOrders = () =>
  customerApi.get('/api/orders').then(r => Array.isArray(r.data) ? r.data : [])

export const placeOrder = (data) =>
  customerApi.post('/api/orders', data).then(r => r.data)

export const getMerchantOrders = (status) =>
  merchantApi.get('/api/orders', { params: status ? { status } : {} }).then(r => Array.isArray(r.data) ? r.data : [])

export const updateOrderStatus = (id, status) =>
  merchantApi.patch(`/api/orders/${id}/status`, { status }).then(r => r.data)

export const cancelOrder = (id) =>
  merchantApi.patch(`/api/orders/${id}/cancel`).then(r => r.data)
