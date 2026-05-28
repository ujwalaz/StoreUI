import customerApi from './customerApi'

export const getMerchantInfo = () =>
  customerApi.get('/api/merchant/info').then(r => r.data)
