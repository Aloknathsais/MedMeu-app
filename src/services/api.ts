import axios from 'axios';

// Was hardcoded to a placeholder URL that isn't your backend at all.
// Now reads from Vite's env, with your local backend as the fallback.
//
// Create a `.env` file at your project root (same level as package.json):
//   VITE_API_BASE_URL=http://localhost:4000/api
// and swap it for your deployed backend URL when you ship.
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api';
const isDev = !!(import.meta as any).env?.DEV;

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

  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(
      `%c→ API ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      'color:#2171a8;font-weight:bold',
      { params: config.params, body: config.data },
    );
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(
        `%c← API ${res.status} ${res.config.method?.toUpperCase()} ${res.config.url}`,
        'color:#2E7D32;font-weight:bold',
        res.data,
      );
    }
    return res;
  },
  (err) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(
        `%c✗ API ${err.response?.status ?? 'ERR'} ${err.config?.method?.toUpperCase()} ${err.config?.url}`,
        'color:#C62828;font-weight:bold',
        { requestBody: err.config?.data, response: err.response?.data, message: err.message },
      );
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('medmeu_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;