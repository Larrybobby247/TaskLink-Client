import { api } from './client.js';

export const settingsApi = {
  getPublic: () => api.get('/settings').then((r) => r.data),
};
