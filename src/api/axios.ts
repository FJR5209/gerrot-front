import axios, { AxiosHeaders } from 'axios';

// Em dev, use /api (proxy do Vite) para evitar CORS e conflitos com rotas do SPA
// Em prod, VITE_API_URL deve apontar para a API real
const baseURL = import.meta.env.VITE_API_URL || '/api';
console.log('[Axios Setup] VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('[Axios Setup] baseURL final:', baseURL);

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  // Pegar token do localStorage e sanitizar (remover <> acidentais e espaços)
  const raw = (localStorage.getItem('token') || '');
  const token = raw.replace(/^\s*<|>\s*$/g, '').trim();

  // Somente log em desenvolvimento para evitar vazar tokens em produção
  if (import.meta.env.DEV) {
    console.log('[Axios Interceptor] ==================');
    console.log('[Axios Interceptor] Method:', config.method?.toUpperCase());
    console.log('[Axios Interceptor] URL:', config.url);
    console.log('[Axios Interceptor] baseURL:', config.baseURL);
    console.log('[Axios Interceptor] Full URL:', (config.baseURL || '') + (config.url || ''));
    console.log('[Axios Interceptor] Token presente?:', !!token);
    console.log('[Axios Interceptor] Token (primeiros 20):', token ? token.substring(0, 20) : 'NENHUM');
    if (raw !== token) console.warn('[Axios Interceptor] Token sanitizado (removidos <> ou espaços)');
  }

  // Garantir que headers exista
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (import.meta.env.DEV) console.log('[Axios Interceptor] Authorization header adicionado');
  }

  // Garantir Content-Type/Accept para chamadas JSON quando ausentes
  const h = config.headers as AxiosHeaders;
  if (!h['Content-Type'] && !(h['content-type'])) {
    h['Content-Type'] = 'application/json';
  }
  if (!h['Accept']) h['Accept'] = 'application/json';

  return config;
});

// Interceptor de resposta para tratar erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[Axios] 401 Unauthorized - Token inválido ou expirado');
      // Limpar token e redirecionar para login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;