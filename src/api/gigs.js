import { api } from './client.js';

export const gigsApi = {
  search: (params) => api.get('/gigs', { params }).then((r) => r.data),
  featured: (limit) => api.get('/gigs/featured', { params: { limit } }).then((r) => r.data),
  get: (id) => api.get(`/gigs/${id}`).then((r) => r.data),

  mine: (status) => api.get('/gigs/mine/list', { params: status ? { status } : {} }).then((r) => r.data),
  myLimit: () => api.get('/gigs/mine/limit').then((r) => r.data),

  create: (payload) => api.post('/gigs', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/gigs/${id}`, payload).then((r) => r.data),
  publish: (id) => api.post(`/gigs/${id}/publish`).then((r) => r.data),
  pause: (id) => api.post(`/gigs/${id}/pause`).then((r) => r.data),
  remove: (id) => api.delete(`/gigs/${id}`).then((r) => r.data),

  uploadImages: (id, formData) => api.post(`/gigs/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  setCoverImage: (id, publicId) => api.post(`/gigs/${id}/cover-image`, { publicId }).then((r) => r.data),
  deleteImage: (id, publicId) => api.delete(`/gigs/${id}/images/${encodeURIComponent(publicId)}`).then((r) => r.data),

  order: (id, payload) => api.post(`/gigs/${id}/order`, payload).then((r) => r.data),
};
