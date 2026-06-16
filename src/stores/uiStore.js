// src/stores/uiStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

// Lista de temas disponíveis
export const AVAILABLE_THEMES = [
  { 
    key: 'light', 
    name: 'Claro', 
    icon: '☀️',
    description: 'Tema claro moderno'
  },
  { 
    key: 'dark', 
    name: 'Escuro', 
    icon: '🌙',
    description: 'Tema escuro elegante'
  },
  { 
    key: 'amethyst', 
    name: 'Amethyst', 
    icon: '💜',
    description: 'Roxo moderno e elegante'
  },
  { 
    key: 'midnight', 
    name: 'Midnight', 
    icon: '🌌',
    description: 'Azul escuro com neon'
  }
]

// Esta função descobre o tema inicial
function getInitialTheme() {
  // 1. Vê se o usuário JÁ escolheu um tema
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && AVAILABLE_THEMES.find(t => t.key === savedTheme)) {
    return savedTheme
  }

  // 2. Se não, vê a preferência do Sistema Operacional (modo noturno do Windows/Mac)
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  // 3. Se não, usa o modo claro
  return 'light'
}

export const useUiStore = defineStore('ui', () => {
  // --- Código do Layout (que você já tem) ---
  const currentLayout = ref(localStorage.getItem('layout') || 'default')
  const layouts = [
    { key: 'default', name: 'Navegação Superior' },
    { key: 'sidebar', name: 'Menu Lateral' },
    { key: 'iconnav', name: 'Minimalista (Ícones)' },
  ]
  function setLayout(layoutName) {
    if (layouts.find(l => l.key === layoutName)) {
      currentLayout.value = layoutName
      localStorage.setItem('layout', layoutName)
    }
  }

  // --- SISTEMA DE TEMAS MELHORADO ---
  const theme = ref(getInitialTheme())

  function setTheme(newTheme) {
    if (AVAILABLE_THEMES.find(t => t.key === newTheme)) {
      theme.value = newTheme
      localStorage.setItem('theme', newTheme)
    }
  }

  function toggleTheme() {
    // Alterna entre light e dark (compatibilidade com código antigo)
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
  }

  function nextTheme() {
    const currentIndex = AVAILABLE_THEMES.findIndex(t => t.key === theme.value)
    const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length
    setTheme(AVAILABLE_THEMES[nextIndex].key)
  }
  // --- FIM DO SISTEMA DE TEMAS ---


  return { 
    currentLayout, 
    layouts, 
    setLayout,
    // Exporta as funções de tema
    theme,
    setTheme,
    toggleTheme,
    nextTheme,
    availableThemes: AVAILABLE_THEMES
  }
})