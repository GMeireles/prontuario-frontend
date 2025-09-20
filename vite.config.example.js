import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',   // permite acesso externo
    port: 6263,        // ou outra porta que você queira
    allowedHosts: ['dev.prontuario.vexial.com.br'],
  }
})
