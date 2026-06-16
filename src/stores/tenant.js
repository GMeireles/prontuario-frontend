import { defineStore } from 'pinia';
import { useAuthStore } from './auth.js';
import { listTenants } from '../api/tenants.js';

let fetchTenantsInFlight = null;

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    tenantId: localStorage.getItem('tenant_id') || null,
    tenants: [],
    loading: false,
    error: null,
  }),

  getters: {
    currentTenant(state) {
      return state.tenants.find((t) => t.id === parseInt(state.tenantId, 10)) || null;
    },

    isSubscriptionAccessAllowed: () => true,
    requiresSubscriptionPayment: () => false,
    subscriptionBlockReason: () => null,
    trialEndsAt: () => null,
    isSubscriptionActive: () => true,
    currentPlanId: (state) => state.currentTenant?.plan_id || null,

    can: () => {
      const auth = useAuthStore();
      return (permission) => auth.can(permission);
    },
  },

  actions: {
    syncFromAuth() {
      const auth = useAuthStore();
      const tid = auth.user?.tenant_id;
      if (!tid) return;

      this.tenantId = String(tid);
      localStorage.setItem('tenant_id', this.tenantId);

      if (!this.tenants.find((t) => t.id === tid)) {
        this.tenants = [
          {
            id: tid,
            name: auth.user?.tenant_name || 'Clínica',
          },
        ];
      }
    },

    async fetchTenants() {
      if (fetchTenantsInFlight) return fetchTenantsInFlight;

      fetchTenantsInFlight = (async () => {
        this.loading = true;
        this.error = null;
        try {
          this.syncFromAuth();

          const auth = useAuthStore();
          if (auth.isMaster) {
            try {
              const rows = await listTenants();
              if (Array.isArray(rows) && rows.length > 0) {
                this.tenants = rows;
                if (!this.tenantId && rows[0]?.id) {
                  this.setTenant(rows[0].id);
                }
              }
            } catch {
              /* admin sem lista — mantém stub do JWT */
            }
          }
        } catch (e) {
          this.error = e.message;
        } finally {
          this.loading = false;
          fetchTenantsInFlight = null;
        }
      })();

      return fetchTenantsInFlight;
    },

    setTenant(id) {
      this.tenantId = id ? String(id) : null;
      if (this.tenantId) {
        localStorage.setItem('tenant_id', this.tenantId);
      } else {
        localStorage.removeItem('tenant_id');
      }
    },

    reset() {
      this.tenantId = null;
      this.tenants = [];
      this.loading = false;
      this.error = null;
      localStorage.removeItem('tenant_id');
    },
  },
});
