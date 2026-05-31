import axios from 'axios';

const SESSION_ID_KEY = 'sessionId';
const TOKEN_KEY = 'token';

const generateSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Array.from({ length: 36 }, (_, i) => {
    if (i === 8 || i === 13 || i === 18 || i === 23) return '-';
    if (i === 14) return '4';
    if (i === 19) return (Math.random() * 4 + 8 | 0).toString(16);
    return Math.floor(Math.random() * 16).toString(16);
  }).join('');
};

const getSessionId = () => {
  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 8) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return generateSessionId();
  }
};

const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) {
  console.error('[api] VITE_API_URL is not defined. Requests will fail.');
}

getSessionId();

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30_000,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-session-id'] = getSessionId();
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      removeToken();
    }

    const data = err.response?.data;
    const rawMessage =
      typeof data?.message === 'string'
        ? data.message
        : typeof data?.error === 'string'
          ? data.error
          : typeof err.message === 'string'
            ? err.message
            : 'Something went wrong';

    const safeMessage = rawMessage.replace(/[<>]/g, '').slice(0, 500);

    const error = new Error(safeMessage);
    error.status = err.response?.status ?? null;
    error.response = err.response ?? null;

    return Promise.reject(error);
  }
);

export default api;