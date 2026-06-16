# FRONTEND_REFACTOR_REPORT.md

> Refatoração do frontend Prontuário para o padrão Marcenaria (ARCHITECTURE_GUIDE §3)  
> Data: 2026-06-16

---

## Branch criada

```
feature/refactor-frontend-base
```

Repositório: `front-end/` (Git independente)

---

## Comandos executados

```bash
cd /var/www/prontuario/front-end
git checkout -b feature/refactor-frontend-base
npm install
npm run build
```

---

## Resultado do build

```
vite v7.1.5 building for production...
✓ 136 modules transformed.
✓ built in 2.47s
exit code: 0
```

Artefatos em `front-end/dist/`.

Aviso não bloqueante: import dinâmico de `stores/auth.js` no interceptor HTTP (chunk splitting).

---

## Arquivos alterados

### Criados

| Caminho | Descrição |
|---------|-----------|
| `src/style.css` | Design tokens + utilities (4 temas) |
| `src/api/http.js` | Cliente Axios canônico |
| `src/api/auth.js` | Login, refresh, logout |
| `src/api/patients.js` | CRUD pacientes |
| `src/api/appointments.js` | Agenda |
| `src/api/anamneses.js` | Anamnese |
| `src/api/evolutions.js` | Evoluções |
| `src/api/prescriptions.js` | Prescrições + anexos |
| `src/api/files.js` | Upload/download arquivos |
| `src/api/tenants.js` | Clínicas (master) |
| `src/api/users.js` | Usuários/profissionais |
| `src/stores/index.js` | Bootstrap Pinia |
| `src/stores/auth.js` | Auth adaptado (accessToken + refresh) |
| `src/stores/tenant.js` | Tenant stub (JWT) |
| `src/stores/uiStore.js` | Temas + layout |
| `src/router/constants.js` | APP_PREFIX, MASTER_PREFIX, redirects |
| `src/router/guards/navigationGuards.js` | Guards canônicos |
| `src/app/layouts/AppLayout.vue` | Shell tenant |
| `src/master/layouts/MasterLayout.vue` | Shell master |
| `src/master/navigation/masterNav.js` | Nav master |
| `src/components/forms/*` | FormInput, FormSelect, FormTextarea, FormButton, BaseModal |
| `src/components/ThemeSwitcher.vue` | Seletor de 4 temas |
| `src/components/ConfirmModal.vue` | Confirmação de ações |
| `src/components/PatientModal.vue` | CRUD paciente em modal |
| `src/constants/branding.js` | Nome do app |
| `.env.example` | Variáveis documentadas |

### Modificados

| Caminho | Mudança |
|---------|---------|
| `src/main.js` | Pinia centralizado, `style.css`, sem dark forçado |
| `src/App.vue` | Theme watcher + `authStore.initialize()` |
| `src/router/index.js` | Rotas `/app/*`, `/master/*`, lazy load, redirects legados |
| `src/views/*.vue` | Removido BaseLayout; tokens + forms |
| `src/components/prontuario/*.vue` | API modules + design system |
| `.env` | Adicionado `VITE_API_BASE_URL` |

### Removidos

| Caminho | Motivo |
|---------|--------|
| `src/services/*` | Migrado para `src/api/` |
| `src/store/AuthStore.js`, `counter.js` | Migrado para `src/stores/` |
| `src/layouts/BaseLayout.vue` | Substituído por AppLayout via router |
| `src/components/BaseModal.vue` | Substituído por `components/forms/BaseModal.vue` |
| `src/assets/tailwind.css` | Substituído por `src/style.css` |
| `src/services/RecordService.js` | Legado não utilizado |
| `src/services/UploadService.js` | Morto / duplicado |

---

## Padrões aplicados (ARCHITECTURE_GUIDE)

| Seção | Padrão |
|-------|--------|
| §3.1 | Estrutura `api/`, `stores/`, `app/layouts/`, `master/`, `router/guards/` |
| §3.2 | Dual-shell AppLayout + MasterLayout; sidebar colapsável |
| §3.3 | Form system (`components/forms/`), BaseModal com Teleport |
| §3.4 | Pinia: auth, tenant (stub), uiStore |
| §3.5 | HTTP thin wrappers por domínio; interceptors 401/402/retry |
| §3.6 | Rotas `/app/*`, names `app-*` / `master-*`, meta completa |
| §3.7 | `navigationGuards.js` extraído |
| §3.9 | CSS tokens `--color-*`, 4 temas, classes semânticas |

---

## Telas refatoradas

| Tela | Rota nova | Comportamento |
|------|-----------|---------------|
| Login | `/login` | Auth via `stores/auth.js`; FormInput/FormButton |
| Dashboard | `/app/dashboard` | Atalhos + agenda + pacientes recentes |
| Pacientes | `/app/pacientes` | CRUD + PatientModal; ConfirmModal para exclusão |
| Consultas | `/app/consultas` | Tabela responsiva + BaseModal |
| Prontuário | `/app/prontuario/:id` | Tabs: dados, anamnese, evoluções, prescrições, arquivos |
| Clínicas (master) | `/master/clinicas` | CRUD tenants; MasterLayout |

**Redirects legados:** `/dashboard`, `/patients`, `/consultas`, `/tenants`, `/prontuario/:id`

---

## Adaptações sem backend (stubs)

| Padrão guia | Implementação atual |
|-------------|---------------------|
| `auth_token` + user object da API | Mantidos `accessToken`/`refreshToken`; espelho em `auth_token` |
| `GET /auth/my-tenants` | `tenantStore.syncFromAuth()` deriva `tenant_id` do JWT |
| `can(feature)` por plano | Stub: sempre `true` |
| `requiresSubscriptionPayment` | Stub: sempre `false` |
| `X-Tenant-ID` header | Enviado quando `tenant_id` disponível no JWT |
| `isMaster` via flag backend | Mapeado para `user.role === 'admin'` |

---

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Bookmarks em URLs antigas | Redirects em `router/index.js` |
| Respostas API heterogêneas | Módulos `api/*` preservam normalização anterior |
| Admin clínica = master guard | `requiresMaster` usa `role === 'admin'` (comportamento anterior de TenantsView) |
| `.env` com URL de produção | `VITE_API_BASE_URL` adicionado sem remover `VITE_API_URL` |
| Refresh token | Implementado em `api/auth.js` + `stores/auth.refresh()` |

---

## Pendências (fora deste escopo)

- Billing / Stripe / `/app/assinatura` funcional
- `GET /auth/my-tenants` e seletor multi-clínica real
- `CommandPalette`, Meta Pixel, Chart.js
- Composable `useFixedRowActionMenu` (não necessário nas telas atuais)
- Renomear campos EN → PT nos models/API
- Integração backend para feature gates e subscription 402 real

---

## Estrutura final

```
front-end/src/
├── api/                    # HTTP por domínio
├── app/layouts/AppLayout.vue
├── master/layouts/MasterLayout.vue
├── components/forms/
├── components/prontuario/
├── composables/            # (reservado)
├── constants/
├── router/constants.js
├── router/guards/navigationGuards.js
├── stores/auth.js, tenant.js, uiStore.js
├── style.css
└── views/
```

---

*Refatoração concluída conforme MIGRATION_PLAN.md Fase 2.*

---

## Fase 3 — Auditoria de integração (2026-06-16)

Ver [`INTEGRATION_AUDIT_REPORT.md`](INTEGRATION_AUDIT_REPORT.md) para detalhes completos.

**Correções frontend nesta fase:**
- Refresh token automático no interceptor HTTP (401)
- Tipos de arquivo alinhados ao ENUM do backend
- `created_at` / unwrap de respostas `{ success, data }`
- `fetchUser()` via `/auth/me` após login

**Build pós-auditoria:** `npm run build` — OK (136 módulos).
