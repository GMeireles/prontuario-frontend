import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/AuthStore'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import PacientesView from '../views/PacientesView.vue'
import ConsultasView from '../views/ConsultasView.vue'
import ProntuarioView from '../views/ProntuarioView.vue'
import TenantsView from '../views/TenantsView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: DashboardView, meta: { title: 'Dashboard' } },
  { path: '/patients', component: PacientesView, meta: { title: 'Pacientes' } },
  { path: '/consultas', component: ConsultasView, meta: { title: 'Agenda' } },
  { path: '/prontuario/:id', component: ProntuarioView, meta: { title: 'Prontuário' } },
  { path: '/tenants', component: TenantsView, meta: { title: 'Clínicas', role: 'admin' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de autenticação + roles
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isAuthenticated) {
    return '/login'
  }

  if (to.meta.role && auth.user?.role !== to.meta.role) {
    return '/dashboard'
  }
})

export default router
