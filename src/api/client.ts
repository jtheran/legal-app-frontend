import axios from 'axios';

// Tu backend de Express corre por defecto en el puerto 5000
const API_URL = process.env.NEXT_PUBLIC_API_URL ||'http://localhost:4568/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor para leer el token del localStorage e inyectarlo en cada petición
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('legal_auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;