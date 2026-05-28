import merchantApi from './merchantApi'

export const getInventory = () =>
  merchantApi.get('/api/inventory').then(r => Array.isArray(r.data) ? r.data : [])

export const getLowStock = () =>
  merchantApi.get('/api/inventory/low-stock').then(r => Array.isArray(r.data) ? r.data : [])

export const updateInventory = (productId, quantity) =>
  merchantApi.put(`/api/inventory/${productId}`, { quantity }).then(r => r.data)
