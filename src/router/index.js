import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '../app/layouts/AppLayout.vue';
import MasterLayout from '../master/layouts/MasterLayout.vue';
import { APP_HOME, APP_PREFIX, LOGIN_PATH, MASTER_PREFIX } from './constants.js';
import { runNavigationGuards } from './guards/navigationGuards.js';

const LoginView = () => import('../views/LoginView.vue');
const DashboardView = () => import('../views/DashboardView.vue');
const PacientesView = () => import('../views/PacientesView.vue');
const ConsultasView = () => import('../views/ConsultasView.vue');
const ProntuarioView = () => import('../views/ProntuarioView.vue');
const TenantsView = () => import('../views/TenantsView.vue');
const BillingView = () => import('../views/BillingView.vue');
const SettingsView = () => import('../views/SettingsView.vue');
const AnamneseTemplatesView = () => import('../views/AnamneseTemplatesView.vue');

const legacyRedirects = [
  ['/dashboard', `${APP_PREFIX}/dashboard`],
  ['/patients', `${APP_PREFIX}/pacientes`],
  ['/consultas', `${APP_PREFIX}/consultas`],
  ['/assinatura', `${APP_PREFIX}/billing`],
  ['/billing', `${APP_PREFIX}/billing`],
  ['/settings', `${APP_PREFIX}/settings`],
  ['/tenants', `${MASTER_PREFIX}/clinicas`],
].map(([path, redirect]) => ({ path, redirect }));

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: LOGIN_PATH,
      name: 'login',
      component: LoginView,
      meta: {
        title: 'Login',
        requiresAuth: false,
        context: 'public',
        noLayout: true,
      },
    },
    {
      path: '/',
      redirect: () =>
        localStorage.getItem('accessToken') || localStorage.getItem('auth_token')
          ? APP_HOME
          : LOGIN_PATH,
    },
    ...legacyRedirects,
    {
      path: '/prontuario/:id',
      redirect: (to) => `${APP_PREFIX}/prontuario/${to.params.id}`,
    },
    {
      path: APP_PREFIX,
      component: AppLayout,
      meta: { requiresAuth: true, context: 'app', layout: 'app' },
      children: [
        {
          path: 'dashboard',
          name: 'app-dashboard',
          component: DashboardView,
          meta: { title: 'Dashboard', requiresFeature: 'dashboard' },
        },
        {
          path: 'pacientes',
          name: 'app-pacientes',
          component: PacientesView,
          meta: { title: 'Pacientes', requiresFeature: 'patients' },
        },
        {
          path: 'consultas',
          name: 'app-consultas',
          component: ConsultasView,
          meta: { title: 'Agenda', requiresFeature: 'appointments' },
        },
        {
          path: 'prontuario/:id',
          name: 'app-prontuario',
          component: ProntuarioView,
          meta: { title: 'Prontuário', requiresFeature: 'patients' },
        },
        {
          path: 'billing',
          name: 'app-billing',
          component: BillingView,
          meta: { title: 'Planos e Assinatura', requiresFeature: 'billing.view' },
        },
        {
          path: 'settings',
          name: 'app-settings',
          component: SettingsView,
          meta: { title: 'Configurações', requiresFeature: 'billing.view' },
        },
        {
          path: 'settings/anamnese-templates',
          name: 'app-anamnese-templates',
          component: AnamneseTemplatesView,
          meta: { title: 'Modelos de Anamnese' },
        },
      ],
    },
    {
      path: MASTER_PREFIX,
      component: MasterLayout,
      meta: { requiresAuth: true, requiresMaster: true, context: 'master', layout: 'master' },
      children: [
        {
          path: 'clinicas',
          name: 'master-clinicas',
          component: TenantsView,
          meta: { title: 'Clínicas', requiresMaster: true },
        },
      ],
    },
  ],
});

router.beforeEach(runNavigationGuards);

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} — Prontuário`;
  }
});

export default router;
