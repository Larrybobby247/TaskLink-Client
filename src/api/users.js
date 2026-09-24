import { api } from './client.js';

export const usersApi = {
  updateProfile: (payload) => api.patch('/users/profile', payload).then((r) => r.data),
  updateBankDetails: (payload) => api.post('/withdrawals/bank-account', payload).then((r) => r.data),
  getPublicProfile: (id) => api.get(`/users/profile/${id}`).then((r) => r.data),
  switchMode: (mode) => api.post('/users/mode', { mode }).then((r) => r.data),
  uploadProfileImage: (formData) => api.post('/users/profile/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  getMyWorkerProfile: () => api.get('/users/worker-profile/me').then((r) => r.data),
  updateWorkerProfile: (payload) => api.patch('/users/worker-profile/me', payload).then((r) => r.data),
};

export const workersApi = {
  search: (params) => api.get('/workers', { params }).then((r) => r.data),
  get: (id) => api.get(`/workers/${id}`).then((r) => r.data),
};

export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data),
  markRead: (id) => api.post(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post('/notifications/read-all').then((r) => r.data),
};

export const messagesApi = {
  conversations: (params) => api.get('/messages/conversations', { params }).then((r) => r.data),
  startConversation: (applicationId) => api.post('/messages/conversations', { applicationId }).then((r) => r.data),
  messages: (conversationId, params) => api.get(`/messages/conversations/${conversationId}/messages`, { params }).then((r) => r.data),
  send: (conversationId, payload) => api.post(`/messages/conversations/${conversationId}/messages`, payload).then((r) => r.data),
};

export const subscriptionsApi = {
  initialize: () => api.post('/subscriptions/initialize').then((r) => r.data),
  mine: () => api.get('/subscriptions/mine').then((r) => r.data),
};
