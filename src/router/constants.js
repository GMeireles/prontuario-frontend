/** Prefixos de contexto SPA */
export const APP_PREFIX = '/app';
export const MASTER_PREFIX = '/master';

export const LOGIN_PATH = '/login';

/** Home pós-login operacional */
export const APP_HOME = `${APP_PREFIX}/dashboard`;

/** Entrada da área master */
export const MASTER_ENTRY = `${MASTER_PREFIX}/clinicas`;

/** Tela de billing / assinatura */
export const SUBSCRIPTION_PATH = `${APP_PREFIX}/billing`;

export const BILLING_PATH = SUBSCRIPTION_PATH;
export const SETTINGS_PATH = `${APP_PREFIX}/settings`;

export const SUBSCRIPTION_ALLOWED_PATHS = [
  SUBSCRIPTION_PATH,
  SETTINGS_PATH,
  '/obrigado',
  '/billing/success',
  '/billing/cancel',
  '/checkout/processando',
];

export function isSubscriptionAllowedPath(path) {
  if (!path) return false;
  return SUBSCRIPTION_ALLOWED_PATHS.some(
    (allowed) => path === allowed || path.startsWith(`${allowed}/`)
  );
}

export function isBareShellPath(path) {
  if (!path) return false;
  return path === LOGIN_PATH || path.startsWith('/billing/') || path.startsWith('/checkout/');
}
