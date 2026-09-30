import { api } from './client.js';

export const reportsApi = {
  // targetType 'SUPPORT' + no targetId = a general Help & Support message,
  // shows up in the admin Reports queue like any other report.
  create: (payload) => api.post('/reports', payload).then((r) => r.data),
  mine: (params) => api.get('/reports/mine', { params }).then((r) => r.data),
};
