<template>
  <div class="flex items-center justify-center h-screen bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            v-model="email"
            type="email"
            class="mt-1 block w-full border rounded-md p-2 focus:ring focus:ring-blue-300"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Senha</label>
          <input
            v-model="password"
            type="password"
            class="mt-1 block w-full border rounded-md p-2 focus:ring focus:ring-blue-300"
            placeholder="********"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
          :disabled="loading"
        >
          <span v-if="!loading">Entrar</span>
          <span v-else>Entrando...</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/AuthStore'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const email = ref('')
const password = ref('')
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function handleLogin() {
  try {
    loading.value = true
    await auth.login(email.value, password.value)
    toast.success('Login realizado com sucesso!')
    router.push('/dashboard')
  } catch (err) {
    toast.error(err.response?.data?.error || 'Erro ao tentar logar')
  } finally {
    loading.value = false
  }
}
</script>
