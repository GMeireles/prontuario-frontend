import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import 'vue3-toastify/dist/index.css'
import './assets/tailwind.css'

document.documentElement.classList.add("dark") // força dark mode padrão pelo tailwind


const app = createApp(App)



app.use(createPinia())
app.use(router)

app.mount('#app')
