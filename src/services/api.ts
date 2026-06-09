import axios from 'axios';

const BASE_URL = 'https://api.medmeu.com/v1'; // Replace with your actual API

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = localStorage.getItem('medmeu_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medmeu_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
