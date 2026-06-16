import { createApp } from 'vue';
import { router } from './router/index.js';
import { pinia } from './stores/index.js';
import './style.css';
import App from './App.vue';
import 'vue3-toastify/dist/index.css';

const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount('#app');
