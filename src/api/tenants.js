import http from './http.js';
import { unwrapData, unwrapList } from './response.js';

export function listTenants() {
  return http.get('/tenants').then((r) => unwrapList(r.data));
}

export function getTenant(id) {
  return http.get(`/tenants/${id}`).then((r) => unwrapData(r.data));
}

export function createTenant(data) {
  return http.post('/tenants', data).then((r) => unwrapData(r.data));
}

export function updateTenant(id, data) {
  return http.put(`/tenants/${id}`, data).then((r) => unwrapData(r.data));
}

export function deleteTenant(id) {
  return http.delete(`/tenants/${id}`).then((r) => unwrapData(r.data));
}
