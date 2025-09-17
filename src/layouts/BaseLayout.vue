<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-md">
      <div class="p-4 text-xl font-bold border-b">Prontuário</div>
      <nav class="p-4 space-y-2">
        <router-link to="/dashboard" class="block p-2 rounded hover:bg-gray-200">Dashboard</router-link>
        <router-link to="/patients" class="block p-2 rounded hover:bg-gray-200">Pacientes</router-link>
        <router-link to="/consultas" class="block p-2 rounded hover:bg-gray-200">Agenda</router-link>
        <router-link to="/tenants" v-if="isAdmin" class="block p-2 rounded hover:bg-gray-200">Clínicas</router-link>
        <button @click="logout" class="block p-2 w-full text-left rounded hover:bg-red-100 text-red-600">
          Sair
        </button>
      </nav>
    </aside>

    <!-- Conteúdo -->
    <main class="flex-1 flex flex-col">
      <!-- Navbar -->
      <header class="bg-white shadow p-4 flex justify-between items-center">
        <h1 class="text-lg font-semibold">{{ title }}</h1>
        <span class="text-sm text-gray-600">Olá, {{ user?.name }}</span>
      </header>

      <!-- Page content -->
      <section class="flex-1 overflow-y-auto p-6">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '../store/AuthStore'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const user = computed(() => auth.user)
const isAdmin = computed(() => user.value?.role === 'admin')
const title = computed(() => route.meta.title || 'Prontuário')

function logout() {
  auth.logout()
  router.push('/login')
}
</script>
