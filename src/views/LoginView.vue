<template>
  <div class="flex min-h-dvh items-center justify-center bg-primary p-4">
    <div class="w-full max-w-md rounded-xl border border-theme bg-secondary p-6 shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-center text-primary">Login</h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <FormInput
          v-model="email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          required
        />
        <FormInput
          v-model="password"
          label="Senha"
          type="password"
          placeholder="********"
          required
        />
        <FormButton type="submit" variant="primary" class="w-full" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </FormButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';
import { useAuthStore } from '../stores/auth.js';
import { APP_HOME } from '../router/constants.js';
import { FormInput, FormButton } from '../components/forms/index.js';

const email = ref('');
const password = ref('');
const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function handleLogin() {
  try {
    loading.value = true;
    await auth.login(email.value, password.value);
    toast.success('Login realizado com sucesso!');
    const redirect = route.query.redirect;
    router.push(typeof redirect === 'string' ? redirect : APP_HOME);
  } catch (err) {
    toast.error(err.response?.data?.error || 'Erro ao tentar logar');
  } finally {
    loading.value = false;
  }
}
</script>
