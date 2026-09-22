import { api } from './client.js';

export const tasksApi = {
  search: (params) => api.get('/tasks', { params }).then((r) => r.data),
  get: (id) => api.get(`/tasks/${id}`).then((r) => r.data),
  mine: (params) => api.get('/tasks/mine', { params }).then((r) => r.data),
  create: (payload) => api.post('/tasks', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/tasks/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
  publish: (id) => api.post(`/tasks/${id}/publish`).then((r) => r.data),
  pause: (id) => api.post(`/tasks/${id}/pause`).then((r) => r.data),
  save: (id) => api.post(`/tasks/${id}/save`).then((r) => r.data),
  unsave: (id) => api.delete(`/tasks/${id}/save`).then((r) => r.data),
  saved: (params) => api.get('/tasks/saved', { params }).then((r) => r.data),
  apply: (taskId, payload) => api.post(`/tasks/${taskId}/applications`, payload).then((r) => r.data),
  applications: (taskId, params) => api.get(`/tasks/${taskId}/applications`, { params }).then((r) => r.data),
};

export const applicationsApi = {
  mine: (params) => api.get('/applications/mine', { params }).then((r) => r.data),
  withdraw: (id) => api.post(`/applications/${id}/withdraw`).then((r) => r.data),
  shortlist: (id) => api.post(`/applications/${id}/shortlist`).then((r) => r.data),
  reject: (id) => api.post(`/applications/${id}/reject`).then((r) => r.data),
};

export const categoriesApi = {
  list: () => api.get('/categories').then((r) => r.data),
};
