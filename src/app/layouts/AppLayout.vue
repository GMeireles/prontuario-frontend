<template>
  <div class="flex min-h-dvh bg-primary text-primary overflow-x-hidden">
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-black/15 md:hidden"
      @click="closeSidebar"
    ></div>

    <aside
      :class="[
        'sidebar-shell fixed top-0 inset-y-0 left-0 z-50 md:static border-theme bg-secondary/95 backdrop-blur-sm flex flex-col overflow-hidden shrink-0',
        isSidebarOpen ? 'w-[85vw] max-w-xs md:w-64 border-r p-4 sidebar-open' : 'w-0 border-r-0 p-0 sidebar-closed',
      ]"
    >
      <div v-show="isSidebarOpen" class="sidebar-content flex flex-col h-full min-h-0">
        <div class="flex items-center gap-2 mb-6 flex-shrink-0">
          <span class="text-lg font-bold text-primary">{{ appName }}</span>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto pr-1">
          <nav class="flex flex-col gap-6" @click="onSidebarNavClick">
            <div>
              <RouterLink :to="`${APP_PREFIX}/dashboard`" class="nav-item">
                Dashboard
              </RouterLink>
            </div>

            <div>
              <h3 class="nav-title">Clínica</h3>
              <div class="flex flex-col gap-1 mt-2">
                <RouterLink :to="`${APP_PREFIX}/pacientes`" class="nav-item">Pacientes</RouterLink>
                <RouterLink :to="`${APP_PREFIX}/consultas`" class="nav-item">Agenda</RouterLink>
              </div>
            </div>
            <div v-if="can('billing.view')">
              <h3 class="nav-title">Administração</h3>
              <div class="flex flex-col gap-1 mt-2">
                <RouterLink :to="SETTINGS_PATH" class="nav-item">Configurações</RouterLink>
                <RouterLink :to="SUBSCRIPTION_PATH" class="nav-item">Planos e Assinatura</RouterLink>
              </div>
            </div>
          </nav>

          <div class="mt-6 flex-shrink-0">
            <div v-if="currentTenant" class="px-3 py-2">
              <p class="text-sm font-medium text-primary">{{ currentTenant.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex-1 min-w-0 flex flex-col">
      <header class="sticky top-0 z-30 border-b border-theme bg-secondary/80 backdrop-blur">
        <div class="mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            class="h-9 w-9 flex items-center justify-center rounded-lg border border-theme bg-tertiary hover:bg-hover text-primary"
            :title="isSidebarOpen ? 'Recolher menu' : 'Abrir menu'"
            @click="toggleSidebar"
          >
            <span class="text-lg">{{ isSidebarOpen ? '⇤' : '⇥' }}</span>
          </button>
          <span class="text-lg font-semibold text-primary truncate">{{ title }}</span>
          <div class="ml-auto flex items-center gap-2 flex-shrink-0">
            <ThemeSwitcher />
            <div v-if="authStore.isAuthenticated" ref="accountMenuWrap" class="relative flex items-center gap-2">
              <button
                type="button"
                class="flex items-center gap-1.5 max-w-[200px] rounded-lg border border-theme bg-tertiary px-2 py-1.5 text-sm text-primary hover:bg-hover"
                aria-haspopup="menu"
                :aria-expanded="accountMenuOpen"
                @click.stop="accountMenuOpen = !accountMenuOpen"
              >
                <span class="truncate">{{ authStore.userName || authStore.userEmail }}</span>
                <span class="text-tertiary text-xs">▾</span>
              </button>
              <div
                v-if="accountMenuOpen"
                class="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-theme bg-secondary py-1 shadow-lg"
                role="menu"
              >
                <RouterLink
                  v-if="authStore.isMaster"
                  :to="MASTER_ENTRY"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-hover"
                  role="menuitem"
                  @click="accountMenuOpen = false"
                >
                  Painel da plataforma
                </RouterLink>
                <button
                  type="button"
                  class="flex w-full items-center px-3 py-2 text-left text-sm text-primary hover:bg-hover"
                  role="menuitem"
                  @click="handleLogout"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl w-full min-w-0 px-4 py-6">
        <SubscriptionBanner />
        <RouterView />
      </main>

      <footer class="px-4 pb-4 text-center text-[10px] text-tertiary">
        Versão: {{ displayVersion }} — Prontuário
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTenantStore } from '../../stores/tenant.js';
import { useAuthStore } from '../../stores/auth.js';
import { APP_NAME } from '../../constants/branding.js';
import { APP_PREFIX, MASTER_ENTRY, LOGIN_PATH, SETTINGS_PATH, SUBSCRIPTION_PATH } from '../../router/constants.js';
import SubscriptionBanner from '../../components/SubscriptionBanner.vue';
import ThemeSwitcher from '../../components/ThemeSwitcher.vue';
import { usePermissions } from '../../composables/usePermissions.js';
import { useBillingStore } from '../../stores/billingStore.js';

const route = useRoute();
const router = useRouter();
const title = computed(() => route.meta?.title ?? 'Painel');
const tenantStore = useTenantStore();
const authStore = useAuthStore();
const billingStore = useBillingStore();
const { can } = usePermissions();
const appName = APP_NAME;

const accountMenuOpen = ref(false);
const accountMenuWrap = ref(null);

const closeAccountMenuOnOutside = (e) => {
  if (!accountMenuOpen.value) return;
  const wrap = accountMenuWrap.value;
  if (wrap && !wrap.contains(e.target)) accountMenuOpen.value = false;
};

onMounted(() => {
  document.addEventListener('click', closeAccountMenuOnOutside);
  if (can('billing.view')) {
    billingStore.fetchSubscription().catch(() => {});
  }
});
onUnmounted(() => {
  document.removeEventListener('click', closeAccountMenuOnOutside);
});

const tenants = computed(() => tenantStore.tenants);
const currentTenant = computed(() => tenantStore.currentTenant);

const isSidebarOpen = ref(localStorage.getItem('sidebarOpen') !== '0');

const displayVersion = computed(() => {
  const envV = import.meta.env.VITE_APP_VERSION;
  return envV && String(envV).trim() ? String(envV).trim() : '—';
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem('sidebarOpen', isSidebarOpen.value ? '1' : '0');
};

const closeSidebar = () => {
  if (!isSidebarOpen.value) return;
  isSidebarOpen.value = false;
  localStorage.setItem('sidebarOpen', '0');
};

const onSidebarNavClick = (event) => {
  if (window.innerWidth >= 768) return;
  const clickedLink = event.target?.closest?.('a');
  if (clickedLink) closeSidebar();
};

const handleLogout = () => {
  accountMenuOpen.value = false;
  authStore.logout();
  router.push(LOGIN_PATH);
};
</script>

<style scoped>
.sidebar-shell {
  transition: width 220ms ease, border-color 220ms ease, padding 220ms ease;
}
.sidebar-content {
  transition: opacity 180ms ease, transform 220ms ease;
}
.sidebar-open .sidebar-content {
  opacity: 1;
  transform: translateX(0);
}
.sidebar-closed .sidebar-content {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
