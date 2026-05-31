import customerApi from './customerApi'
import merchantApi from './merchantApi'

export const customerLogin = (phone) =>
  customerApi.post('/api/auth/customer', { phone: `+91-${phone}` }).then(r => r.data)

export const merchantLogin = (phoneNumber, password) =>
  merchantApi.post('/api/auth/login', { phoneNumber: `+91-${phoneNumber}`, password }).then(r => r.data)
