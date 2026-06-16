<template>
  <RouterView />
</template>

<script setup>
import { watch, onMounted } from 'vue';
import { useUiStore } from './stores/uiStore.js';
import { useAuthStore } from './stores/auth.js';

const uiStore = useUiStore();
const authStore = useAuthStore();

function applyTheme(newTheme) {
  const root = document.documentElement;

  root.classList.remove('dark', 'theme-light', 'theme-dark', 'theme-amethyst', 'theme-midnight');
  root.removeAttribute('data-theme');

  if (newTheme === 'dark') {
    root.classList.add('dark', 'theme-dark');
    root.setAttribute('data-theme', 'dark');
  } else if (newTheme === 'light') {
    root.classList.add('theme-light');
    root.setAttribute('data-theme', 'light');
  } else if (newTheme === 'amethyst') {
    root.classList.add('theme-amethyst');
    root.setAttribute('data-theme', 'amethyst');
  } else if (newTheme === 'midnight') {
    root.classList.add('theme-midnight');
    root.setAttribute('data-theme', 'midnight');
  }
}

watch(
  () => uiStore.theme,
  (newTheme) => {
    applyTheme(newTheme);
  },
  { immediate: true }
);

onMounted(() => {
  authStore.initialize();
});
</script>
