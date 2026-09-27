import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://tasklink-58mu.onrender.com/api',
  withCredentials: true, // sends the HTTP-only auth cookie
});

// Centralized error normalization so components can just read err.message.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API ERROR:', err);
    console.error('API STATUS:', err.response?.status);
    console.error('API DATA:', err.response?.data);

    return Promise.reject({
      message:
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.',
      errors: err.response?.data?.errors,
      status: err.response?.status,
      data: err.response?.data,
    });
  }
);
