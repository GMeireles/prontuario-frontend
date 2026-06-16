<template>
  <div class="relative">
    <!-- Botão principal -->
    <button 
      @click="showMenu = !showMenu"
      class="h-9 w-9 rounded-lg border text-xl flex items-center justify-center transition-all duration-200"
      :class="buttonClasses"
      aria-label="Selecionar tema"
    >
      <span>{{ currentThemeIcon }}</span>
    </button>

    <!-- Menu dropdown -->
    <div 
      v-if="showMenu"
      class="absolute right-0 top-12 w-56 rounded-xl shadow-xl z-50 overflow-hidden"
      :class="menuClasses"
      @click.stop
    >
      <div class="p-2 space-y-1">
        <button
          v-for="themeOption in uiStore.availableThemes"
          :key="themeOption.key"
          @click="selectTheme(themeOption.key)"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
          :class="getThemeButtonClasses(themeOption.key)"
        >
          <span class="text-lg">{{ themeOption.icon }}</span>
          <div class="flex-1 text-left">
            <div>{{ themeOption.name }}</div>
            <div class="text-xs opacity-75">{{ themeOption.description }}</div>
          </div>
          <span v-if="uiStore.theme === themeOption.key" class="text-xs">✓</span>
        </button>
      </div>
    </div>

    <!-- Overlay para fechar o menu -->
    <div 
      v-if="showMenu"
      class="fixed inset-0 z-40"
      @click="showMenu = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUiStore } from '../stores/uiStore';

const uiStore = useUiStore();
const showMenu = ref(false);

const currentThemeIcon = computed(() => {
  const theme = uiStore.availableThemes.find(t => t.key === uiStore.theme);
  return theme?.icon || '🌙';
});

const buttonClasses = computed(() => {
  return {
    'border-theme bg-tertiary hover:bg-hover text-primary': true
  };
});

const menuClasses = computed(() => {
  return {
    'bg-secondary border border-theme': true
  };
});

function getThemeButtonClasses(themeKey) {
  const isActive = uiStore.theme === themeKey;
  return {
    'bg-tertiary text-primary hover:bg-hover': !isActive,
    'bg-primary text-primary border-2': isActive,
    'border-theme': true
  };
}

function selectTheme(themeKey) {
  uiStore.setTheme(themeKey);
  showMenu.value = false;
}

// Fechar menu ao pressionar ESC
function handleEscape(e) {
  if (e.key === 'Escape') {
    showMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>