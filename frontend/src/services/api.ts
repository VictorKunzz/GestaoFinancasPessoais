import axios from 'axios';

// Instância Axios configurada para a API
// Em desenvolvimento, o Vite proxy redireciona /api para localhost:3000
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: adiciona token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: redireciona para login se token expirou (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpa dados de autenticação
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redireciona para login (exceto se já está na página de login)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
