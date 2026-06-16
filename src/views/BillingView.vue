<template>
  <div class="space-y-6">
    <div v-if="route.query.expired === '1'" class="p-4 rounded-lg border border-warning/40 bg-warning/10 text-sm text-primary">
      Sua assinatura está inativa ou com pagamento pendente. Regularize abaixo para continuar usando o sistema.
    </div>

    <div v-if="route.query.success === '1'" class="p-4 rounded-lg border border-success/40 bg-success/10 text-sm text-primary">
      Checkout concluído. A assinatura será atualizada em instantes.
    </div>

    <div v-if="route.query.canceled === '1'" class="p-4 rounded-lg border border-theme bg-secondary text-sm text-secondary">
      Checkout cancelado. Você pode tentar novamente quando quiser.
    </div>

    <section class="p-4 rounded-xl border border-theme bg-secondary space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-lg font-semibold text-primary">Assinatura atual</h2>
        <button
          v-if="billingStore.subscription?.stripe_subscription_id || currentTenant?.stripe_customer_id"
          type="button"
          class="ml-auto px-3 py-1.5 rounded-lg border border-theme bg-tertiary hover:bg-hover text-primary text-sm disabled:opacity-50"
          :disabled="billingStore.portalLoading"
          @click="openPortal"
        >
          {{ billingStore.portalLoading ? 'Abrindo...' : 'Gerenciar no Stripe' }}
        </button>
      </div>

      <div v-if="billingStore.loading" class="text-sm text-secondary">Carregando assinatura...</div>
      <div v-else class="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p class="text-tertiary">Plano</p>
          <p class="text-primary font-medium">{{ billingStore.currentPlan?.name || '—' }}</p>
        </div>
        <div>
          <p class="text-tertiary">Status</p>
          <p :class="billingStore.isSubscriptionActive ? 'text-success' : 'text-warning'" class="font-medium">
            {{ billingStore.subscriptionStatus || '—' }}
          </p>
        </div>
      </div>

      <p v-if="billingStore.error" class="text-sm text-error">{{ billingStore.error }}</p>
    </section>

    <section class="space-y-3">
      <h3 class="text-lg font-semibold text-primary">Planos disponíveis</h3>
      <div v-if="plansLoading" class="text-sm text-secondary">Carregando planos...</div>
      <div v-else class="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          v-for="plan in billingStore.plans"
          :key="plan.id"
          class="p-4 rounded-xl border border-theme bg-secondary space-y-3"
          :class="plan.id === billingStore.currentPlan?.id ? 'ring-2 ring-primary/30' : ''"
        >
          <div>
            <p class="font-semibold text-primary">{{ plan.name }}</p>
            <p v-if="plan.description" class="text-xs text-tertiary mt-1">{{ plan.description }}</p>
          </div>
          <p class="text-primary font-medium">{{ formatPrice(plan) }}</p>
          <ul class="text-xs text-secondary space-y-1">
            <li>Usuários: {{ plan.max_users ?? 'ilimitado' }}</li>
            <li>Pacientes: {{ plan.max_patients ?? 'ilimitado' }}</li>
            <li>Armazenamento: {{ plan.max_storage_mb ? `${plan.max_storage_mb} MB` : 'ilimitado' }}</li>
          </ul>
          <button
            v-if="canManage"
            type="button"
            class="w-full px-3 py-2 rounded-lg border border-theme bg-tertiary hover:bg-hover text-primary text-sm disabled:opacity-50"
            :disabled="billingStore.checkoutLoading || plan.id === billingStore.currentPlan?.id"
            @click="checkout(plan)"
          >
            {{ plan.id === billingStore.currentPlan?.id ? 'Plano atual' : 'Contratar / alterar' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useBillingStore } from '../stores/billingStore.js';
import { useTenantStore } from '../stores/tenant.js';
import { usePermissions } from '../composables/usePermissions.js';

const route = useRoute();
const billingStore = useBillingStore();
const tenantStore = useTenantStore();
const { can } = usePermissions();
const plansLoading = ref(false);

const currentTenant = computed(() => tenantStore.currentTenant);
const canManage = computed(() => can('billing.manage'));

function formatPrice(plan) {
  if (!plan.price_cents) return 'Grátis';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: (plan.currency || 'brl').toUpperCase(),
  }).format(plan.price_cents / 100);
}

async function checkout(plan) {
  try {
    await billingStore.startCheckout({ planId: plan.id, planSlug: plan.slug });
  } catch {
    /* erro exibido no store */
  }
}

async function openPortal() {
  try {
    await billingStore.openPortal();
  } catch {
    /* erro exibido no store */
  }
}

onMounted(async () => {
  plansLoading.value = true;
  try {
    await Promise.all([billingStore.fetchSubscription(), billingStore.fetchPlans()]);
  } finally {
    plansLoading.value = false;
  }
});
</script>
