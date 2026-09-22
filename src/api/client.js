import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://tasklink-58mu.onrender.com/api',
  withCredentials: true, // sends the HTTP-only auth cookie
});

// Centralized error normalization so components can just read err.message.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      'Something went wrong. Please try again.';

    const errors = err.response?.data?.errors;

    return Promise.reject({
      message,
      errors,
      status: err.response?.status,
    });
  }
);