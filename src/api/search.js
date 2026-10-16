import { api } from './client.js';

// type: 'workers' | 'gigs'
export const searchApi = {
  run: (params) => api.get('/search', { params }).then((r) => r.data),
};
