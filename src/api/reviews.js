import { api } from './client.js';

export const reviewsApi = {
  create: (orderIdOrPayload, payload) => {
    const isLegacy = typeof orderIdOrPayload !== 'string' && !(orderIdOrPayload instanceof String);
    const resolvedOrderId = isLegacy ? orderIdOrPayload?.orderId : orderIdOrPayload;
    const requestData = isLegacy ? orderIdOrPayload : payload || {};

    return api.post(`/orders/${resolvedOrderId}/review`, {
      rating: requestData.rating,
      comment: requestData.comment,
    });
  },

  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  getOrderReview: (orderId) => api.get(`/reviews/order/${orderId}`),
  getWorkerReviews: (workerId) => api.get(`/reviews/user/${workerId}`),
};
