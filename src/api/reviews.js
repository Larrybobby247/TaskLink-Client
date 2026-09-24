import api from './client.js';

export const reviewsApi = {
  create: (data) => api.post('/reviews', data),

  getWorkerReviews: (workerId) =>
    api.get(`/reviews/worker/${workerId}`),
};
