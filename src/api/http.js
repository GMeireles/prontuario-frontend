import axios from 'axios';
import { useAuthStore } from '../stores/auth.js';
import { useTenantStore } from '../stores/tenant.js';
import { LOGIN_PATH, SUBSCRIPTION_PATH } from '../router/constants.js';

const base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
const baseURL = String(base || '').replace(/\/+$/, '');

const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  try {
    const auth = useAuthStore();
    const tenant = useTenantStore();

    const token = auth?.token || auth?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const noTenantRoutes = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/me'];
    const needsTenant = !noTenantRoutes.some((route) => config.url?.includes(route));

    const tenantId = tenant?.tenantId;
    if (tenantId && needsTenant) {
      config.headers['X-Tenant-ID'] = String(tenantId);
    }
  } catch (e) {
    console.error('Erro no interceptor de requisição:', e);
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err?.config;
    const status = err?.response?.status;

    if (status === 401 && cfg && !cfg.url?.includes('/auth/login') && !cfg.url?.includes('/auth/refresh')) {
      try {
        const authStore = useAuthStore();
        if (authStore.refreshToken && !cfg.__isRetryAfterRefresh) {
          cfg.__isRetryAfterRefresh = true;
          await authStore.refresh();
          cfg.headers.Authorization = `Bearer ${authStore.accessToken}`;
          return http(cfg);
        }
        authStore.logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith(LOGIN_PATH)) {
          window.location.href = LOGIN_PATH;
        }
      } catch (e) {
        console.error('Erro ao renovar token:', e);
        try {
          const authStore = useAuthStore();
          authStore.logout();
        } catch {
          /* ignore */
        }
      }
      return Promise.reject(err);
    }

    if (status === 402) {
      try {
        if (typeof window !== 'undefined') {
          const p = window.location.pathname;
          const isOnSubscription =
            p === SUBSCRIPTION_PATH || p.startsWith(`${SUBSCRIPTION_PATH}/`);
          if (!isOnSubscription) {
            window.location.href = `${SUBSCRIPTION_PATH}?expired=1`;
          }
        }
      } catch (e) {
        console.error('Erro ao redirecionar para assinatura:', e);
      }
      return Promise.reject(err);
    }

    if (!cfg) return Promise.reject(err);

    const method = (cfg.method || '').toLowerCase();
    const safeMethods = ['get', 'head', 'options', 'put', 'delete'];
    if (!safeMethods.includes(method)) return Promise.reject(err);

    cfg.__retryCount = cfg.__retryCount || 0;
    const MAX_RETRIES = 2;
    if ([429, 502, 503, 504].includes(status) && cfg.__retryCount < MAX_RETRIES) {
      cfg.__retryCount += 1;
      const backoff = 200 * Math.pow(2, cfg.__retryCount);
      await new Promise((r) => setTimeout(r, backoff));
      return http(cfg);
    }

    return Promise.reject(err);
  }
);

export default http;
