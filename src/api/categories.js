import customerApi from './customerApi'
import merchantApi from './merchantApi'

export const getCategories = () =>
  merchantApi.get('/api/categories').then(r => Array.isArray(r.data) ? r.data : [])

export const getCustomerCategories = () =>
  customerApi.get('/api/categories').then(r => Array.isArray(r.data) ? r.data : [])
