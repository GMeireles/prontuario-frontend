import { useAuthStore } from '../../stores/auth.js';
import { useTenantStore } from '../../stores/tenant.js';
import { APP_HOME, LOGIN_PATH } from '../constants.js';

/**
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {import('vue-router').RouteLocationNormalized} from
 * @param {import('vue-router').NavigationGuardNext} next
 */
export async function runNavigationGuards(to, from, next) {
  const hasToken = !!(
    localStorage.getItem('accessToken') ||
    localStorage.getItem('auth_token')
  );
  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !hasToken) {
    if (to.path === LOGIN_PATH) return next();
    return next({ path: LOGIN_PATH, query: { redirect: to.fullPath } });
  }

  const authStore = useAuthStore();
  const tenantStore = useTenantStore();

  const requiresMaster = to.matched.some((r) => r.meta.requiresMaster === true);
  const requiresFeature = to.meta.requiresFeature;
  const isAuthenticated = authStore.isAuthenticated;
  const isMaster = authStore.isMaster;

  if (requiresAuth && !isAuthenticated) {
    if (to.path === LOGIN_PATH) return next();
    return next({ path: LOGIN_PATH, query: { redirect: to.fullPath } });
  }

  if (requiresMaster && !isMaster) {
    return next({ path: APP_HOME });
  }

  if (to.path === LOGIN_PATH && isAuthenticated) {
    return next({ path: APP_HOME });
  }

  if (requiresAuth && isAuthenticated) {
    try {
      if (!tenantStore.loading && (!Array.isArray(tenantStore.tenants) || tenantStore.tenants.length === 0)) {
        await tenantStore.fetchTenants();
      }
    } catch (e) {
      console.error('Erro ao carregar tenants no router:', e);
    }
  }

  if (requiresAuth && isAuthenticated && requiresFeature && !isMaster) {
    const canFn = tenantStore.can;
    const allowed = typeof canFn === 'function' ? canFn(String(requiresFeature)) : true;
    if (!allowed) {
      if (to.path === APP_HOME) return next();
      return next({ path: APP_HOME, query: { denied: String(requiresFeature) } });
    }
  }

  next();
}
