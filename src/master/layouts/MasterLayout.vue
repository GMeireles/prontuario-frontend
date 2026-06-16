<template>
  <div class="flex min-h-dvh bg-primary text-primary overflow-x-hidden master-shell">
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-black/15 md:hidden"
      @click="closeSidebar"
    ></div>

    <aside
      :class="[
        'sidebar-shell fixed top-0 inset-y-0 left-0 z-50 md:static border-theme bg-secondary/95 backdrop-blur-sm flex flex-col overflow-hidden shrink-0 border-r master-aside',
        isSidebarOpen ? 'w-[85vw] max-w-xs md:w-64 p-4 sidebar-open' : 'w-0 border-r-0 p-0 sidebar-closed',
      ]"
    >
      <div v-show="isSidebarOpen" class="sidebar-content flex flex-col h-full min-h-0">
        <div class="flex items-center gap-2 mb-2 flex-shrink-0">
          <span class="text-lg font-bold text-primary">{{ appName }}</span>
        </div>
        <p class="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-4">
          Área master
        </p>

        <div class="flex-1 min-h-0 overflow-y-auto pr-1">
          <nav class="flex flex-col gap-6" @click="onSidebarNavClick">
            <div v-for="(section, si) in masterNavSections" :key="si">
              <h3 class="nav-title">{{ section.title }}</h3>
              <div class="flex flex-col gap-1 mt-2">
                <RouterLink
                  v-for="item in section.items"
                  :key="item.to"
                  :to="{ name: masterRouteName(item.to) }"
                  class="nav-item"
                >
                  {{ item.label }}
                </RouterLink>
              </div>
            </div>
          </nav>

          <div class="mt-8 pt-4 border-t border-theme">
            <RouterLink :to="APP_HOME" class="nav-item font-medium">← Voltar ao sistema</RouterLink>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex-1 min-w-0 flex flex-col">
      <div class="h-1 bg-amber-500/90 shrink-0" aria-hidden="true"></div>
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
          <span class="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 shrink-0">Master</span>
          <span class="text-lg font-semibold text-primary truncate">{{ title }}</span>
          <div class="ml-auto flex items-center gap-2 flex-shrink-0">
            <ThemeSwitcher />
            <div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
              <span class="text-sm text-secondary truncate max-w-[150px]">{{ authStore.userName || authStore.userEmail }}</span>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg border border-theme bg-tertiary hover:bg-hover text-primary text-sm whitespace-nowrap"
                title="Sair"
                @click="handleLogout"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl w-full min-w-0 px-4 py-6">
        <RouterView />
      </main>

      <footer class="px-4 pb-4 text-center text-[10px] text-tertiary">
        Plataforma · Versão: {{ displayVersion }}
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { APP_NAME } from '../../constants/branding.js';
import { APP_HOME, LOGIN_PATH } from '../../router/constants.js';
import { masterNavSections } from '../navigation/masterNav.js';
import ThemeSwitcher from '../../components/ThemeSwitcher.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const title = computed(() => route.meta?.title ?? 'Master');
const appName = APP_NAME;

const isSidebarOpen = ref(localStorage.getItem('sidebarOpenMaster') !== '0');

const displayVersion = computed(() => {
  const envV = import.meta.env.VITE_APP_VERSION;
  return envV && String(envV).trim() ? String(envV).trim() : '—';
});

function masterRouteName(segment) {
  return `master-${segment.replace(/\//g, '-')}`;
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem('sidebarOpenMaster', isSidebarOpen.value ? '1' : '0');
};

const closeSidebar = () => {
  if (!isSidebarOpen.value) return;
  isSidebarOpen.value = false;
  localStorage.setItem('sidebarOpenMaster', '0');
};

const onSidebarNavClick = (event) => {
  if (window.innerWidth >= 768) return;
  const clickedLink = event.target?.closest?.('a');
  if (clickedLink) closeSidebar();
};

const handleLogout = () => {
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
