import { api } from './client.js';

export const pushApi = {
  getPublicKey: () => api.get('/push/vapid-public-key').then((r) => r.data),
  subscribe: (subscription) => api.post('/push/subscribe', { subscription }).then((r) => r.data),
  unsubscribe: (endpoint) => api.post('/push/unsubscribe', { endpoint }).then((r) => r.data),
};
