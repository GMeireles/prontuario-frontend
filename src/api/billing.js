import http from './http.js';
import { unwrapData, unwrapList } from './response.js';

export function listPlans() {
  return http.get('/billing/plans').then((r) => unwrapList(r.data));
}

export function getSubscription() {
  return http.get('/billing/subscription').then((r) => unwrapData(r.data));
}

export function createCheckout(payload) {
  return http.post('/billing/checkout', payload).then((r) => unwrapData(r.data));
}

export function createPortal() {
  return http.post('/billing/portal').then((r) => unwrapData(r.data));
}
