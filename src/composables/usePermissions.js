import { computed } from 'vue';
import { useAuthStore } from '../stores/auth.js';

export function usePermissions() {
  const auth = useAuthStore();

  const role = computed(() => auth.user?.role || null);
  const profile = computed(() => auth.user?.profile || auth.user?.role || null);
  const permissions = computed(() => auth.user?.permissions || []);

  function can(permission) {
    if (!permission) return true;
    if (auth.user?.role === 'admin') return true;
    return permissions.value.includes(permission);
  }

  return { can, role, profile, permissions };
}
