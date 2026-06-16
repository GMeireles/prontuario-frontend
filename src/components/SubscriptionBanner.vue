<template>
  <div
    v-if="visible"
    class="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-primary"
    role="alert"
  >
    <p class="font-medium">Existe um problema com a assinatura da clínica.</p>
    <p class="mt-1 text-secondary">
      Regularize para evitar bloqueios.
      <RouterLink :to="billingPath" class="underline text-primary-color ml-1">Ir para billing</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useBillingStore } from '../stores/billingStore.js';
import { usePermissions } from '../composables/usePermissions.js';
import { SUBSCRIPTION_PATH } from '../router/constants.js';

const billingStore = useBillingStore();
const { can } = usePermissions();

const billingPath = SUBSCRIPTION_PATH;

const visible = computed(() => {
  if (!can('billing.view')) return false;
  return billingStore.hasSubscriptionProblem;
});
</script>
