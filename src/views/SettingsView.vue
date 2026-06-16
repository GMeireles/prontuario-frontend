<template>
  <div class="space-y-6">
    <section class="p-4 rounded-xl border border-theme bg-secondary space-y-2">
      <h2 class="text-lg font-semibold text-primary">Clínica</h2>
      <div v-if="currentTenant" class="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p class="text-tertiary">Nome</p>
          <p class="text-primary font-medium">{{ currentTenant.name }}</p>
        </div>
        <div>
          <p class="text-tertiary">Plano atual</p>
          <p class="text-primary font-medium">{{ billingStore.currentPlan?.name || '—' }}</p>
        </div>
        <div>
          <p class="text-tertiary">Status da assinatura</p>
          <p :class="statusClass">{{ billingStore.subscriptionStatus || '—' }}</p>
        </div>
        <div>
          <p class="text-tertiary">E-mail de cobrança</p>
          <p class="text-primary">{{ currentTenant.billing_email || currentTenant.email || '—' }}</p>
        </div>
      </div>
    </section>

    <section class="p-4 rounded-xl border border-theme bg-secondary space-y-3">
      <h3 class="font-semibold text-primary">Limites do plano</h3>
      <div class="grid sm:grid-cols-3 gap-3 text-sm">
        <div class="p-3 rounded-lg border border-theme bg-tertiary">
          <p class="text-tertiary">Usuários</p>
          <p class="text-primary font-medium">
            {{ usage.users ?? 0 }}
            <span v-if="limits?.max_users">/ {{ limits.max_users }}</span>
            <span v-else>/ ilimitado</span>
          </p>
        </div>
        <div class="p-3 rounded-lg border border-theme bg-tertiary">
          <p class="text-tertiary">Pacientes</p>
          <p class="text-primary font-medium">
            {{ usage.patients ?? 0 }}
            <span v-if="limits?.max_patients">/ {{ limits.max_patients }}</span>
            <span v-else>/ ilimitado</span>
          </p>
        </div>
        <div class="p-3 rounded-lg border border-theme bg-tertiary">
          <p class="text-tertiary">Armazenamento</p>
          <p class="text-primary font-medium">
            {{ usage.storage_mb ?? 0 }} MB
            <span v-if="limits?.max_storage_mb">/ {{ limits.max_storage_mb }} MB</span>
            <span v-else>/ ilimitado</span>
          </p>
        </div>
      </div>
    </section>

    <div class="flex gap-2">
      <RouterLink
        :to="`${APP_PREFIX}/billing`"
        class="px-4 py-2 rounded-lg border border-theme bg-tertiary hover:bg-hover text-primary text-sm"
      >
        Gerenciar planos
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useTenantStore } from '../stores/tenant.js';
import { useBillingStore } from '../stores/billingStore.js';
import { APP_PREFIX } from '../router/constants.js';

const tenantStore = useTenantStore();
const billingStore = useBillingStore();

const currentTenant = computed(() => tenantStore.currentTenant);
const usage = computed(() => billingStore.usage || { users: 0, patients: 0, storage_mb: 0 });
const limits = computed(() => billingStore.limits);

const statusClass = computed(() => {
  if (billingStore.isSubscriptionActive) return 'text-success font-medium';
  if (billingStore.hasSubscriptionProblem) return 'text-warning font-medium';
  return 'text-primary font-medium';
});

onMounted(async () => {
  try {
    await billingStore.fetchSubscription();
  } catch {
    /* billing opcional na tela de settings */
  }
});
</script>
