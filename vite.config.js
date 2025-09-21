import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // permite acesso externo
    port: 6263,      // ou outra porta que você queira
    allowedHosts: ['dev.prontuario.vexial.com.br'],
  }
})
