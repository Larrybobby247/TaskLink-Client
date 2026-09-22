import { api } from './client.js';

export const ordersApi = {
  selectWorker: (applicationId) => api.post('/orders/select-worker', { applicationId }).then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  client: (params) => api.get('/orders/client', { params }).then((r) => r.data),
  worker: (params) => api.get('/orders/worker', { params }).then((r) => r.data),
  submit: (id, payload) => api.post(`/orders/${id}/submit`, payload).then((r) => r.data),
  revision: (id, payload) => api.post(`/orders/${id}/revision`, payload).then((r) => r.data),
  approve: (id) => api.post(`/orders/${id}/approve`).then((r) => r.data),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
  review: (id, payload) => api.post(`/orders/${id}/review`, payload).then((r) => r.data),
  dispute: (id, payload) => api.post(`/orders/${id}/dispute`, payload).then((r) => r.data),
};

export const paymentsApi = {
  initialize: (orderId) => api.post('/payments/initialize', { orderId }).then((r) => r.data),
  verify: (reference) => api.post('/payments/verify', { reference }).then((r) => r.data),
};

export const walletApi = {
  get: () => api.get('/wallet').then((r) => r.data),
  transactions: (params) => api.get('/wallet/transactions', { params }).then((r) => r.data),
};

export const withdrawalsApi = {
  banks: () => api.get('/withdrawals/banks').then((r) => r.data),
  addBankAccount: (payload) => api.post('/withdrawals/bank-account', payload).then((r) => r.data),
  request: (amountKobo) => api.post('/withdrawals', { amountKobo }).then((r) => r.data),
  mine: (params) => api.get('/withdrawals/mine', { params }).then((r) => r.data),
};
