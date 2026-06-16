import { defineStore } from 'pinia';
import { listPlans, getSubscription, createCheckout, createPortal } from '../api/billing.js';

const PROBLEM_STATUSES = new Set(['past_due', 'unpaid', 'canceled', 'incomplete']);

export const useBillingStore = defineStore('billing', {
  state: () => ({
    plans: [],
    subscription: null,
    usage: null,
    loading: false,
    checkoutLoading: false,
    portalLoading: false,
    error: null,
  }),

  getters: {
    currentPlan(state) {
      return state.subscription?.plan || null;
    },

    subscriptionStatus(state) {
      return state.subscription?.status || null;
    },

    isSubscriptionActive(state) {
      const status = state.subscription?.status;
      return status === 'active' || status === 'trialing';
    },

    hasSubscriptionProblem(state) {
      const status = state.subscription?.status;
      return status ? PROBLEM_STATUSES.has(status) : false;
    },

    limits(state) {
      const plan = state.subscription?.plan;
      if (!plan) return null;
      return {
        max_users: plan.max_users,
        max_patients: plan.max_patients,
        max_storage_mb: plan.max_storage_mb,
      };
    },
  },

  actions: {
    async fetchPlans() {
      this.plans = await listPlans();
      return this.plans;
    },

    async fetchSubscription() {
      this.loading = true;
      this.error = null;
      try {
        const data = await getSubscription();
        this.subscription = data?.subscription || null;
        this.usage = data?.usage || null;
        return data;
      } catch (e) {
        this.error = e.message;
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async startCheckout({ planId, planSlug }) {
      this.checkoutLoading = true;
      this.error = null;
      try {
        const result = await createCheckout({ planId, planSlug });
        if (result?.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        }
        return result;
      } catch (e) {
        this.error = e.response?.data?.message || e.message;
        throw e;
      } finally {
        this.checkoutLoading = false;
      }
    },

    async openPortal() {
      this.portalLoading = true;
      this.error = null;
      try {
        const result = await createPortal();
        if (result?.portalUrl) {
          window.location.href = result.portalUrl;
        }
        return result;
      } catch (e) {
        this.error = e.response?.data?.message || e.message;
        throw e;
      } finally {
        this.portalLoading = false;
      }
    },

    reset() {
      this.plans = [];
      this.subscription = null;
      this.usage = null;
      this.loading = false;
      this.checkoutLoading = false;
      this.portalLoading = false;
      this.error = null;
    },
  },
});
