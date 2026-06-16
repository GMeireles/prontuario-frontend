import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import { login as loginAPI, refresh as refreshAPI, logout as logoutAPI, getMe } from '../api/auth.js';
import { useTenantStore } from './tenant.js';

function safeParseUser() {
  try {
    const data = localStorage.getItem('user') || localStorage.getItem('auth_user');
    return data && data !== 'undefined' ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function decodeUserFromToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

function persistTokens(accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('auth_token', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const accessToken =
      localStorage.getItem('accessToken') || localStorage.getItem('auth_token') || null;
    const refreshToken = localStorage.getItem('refreshToken') || null;
    const user = safeParseUser() || (accessToken ? decodeUserFromToken(accessToken) : null);

    return {
      accessToken,
      refreshToken,
      user,
      loading: false,
      error: null,
    };
  },

  getters: {
    token: (state) => state.accessToken,
    isAuthenticated: (state) => !!state.accessToken,
    userEmail: (state) => state.user?.email || null,
    userName: (state) => state.user?.name || state.user?.full_name || null,
    isMaster: (state) => state.user?.role === 'admin',
    masterPermissions: () => [],
    canMaster: (state) => () => state.user?.role === 'admin',
  },

  actions: {
    setSession(accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.user = decodeUserFromToken(accessToken);

      persistTokens(accessToken, refreshToken);
      if (this.user) {
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
    },

    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const { accessToken, refreshToken } = await loginAPI(email, password);
        this.setSession(accessToken, refreshToken);

        const tenantStore = useTenantStore();
        tenantStore.syncFromAuth();
        await this.fetchUser();

        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.error || error.message || 'Erro ao fazer login';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async refresh() {
      if (!this.refreshToken) {
        this.logout();
        return;
      }
      try {
        const { accessToken } = await refreshAPI(this.refreshToken);
        this.setSession(accessToken, this.refreshToken);
      } catch {
        this.logout();
      }
    },

    async fetchUser() {
      if (!this.accessToken) return;
      try {
        const me = await getMe();
        this.user = { ...decodeUserFromToken(this.accessToken), ...me };
      } catch {
        this.user = decodeUserFromToken(this.accessToken);
      }
      if (this.user) {
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
    },

    initialize() {
      if (this.accessToken && !this.user) {
        this.user = decodeUserFromToken(this.accessToken);
      }
      const tenantStore = useTenantStore();
      tenantStore.syncFromAuth();
      if (this.accessToken) {
        this.fetchUser().catch(() => {});
      }
    },

    logout() {
      const refreshToken = this.refreshToken;
      const tenantStore = useTenantStore();

      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_user');

      tenantStore.reset();

      if (refreshToken) {
        logoutAPI(refreshToken).catch(() => {});
      }
    },
  },
});
