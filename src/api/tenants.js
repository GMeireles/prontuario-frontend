import http from './http.js';

export function listTenants() {
  return http.get('/tenants').then((r) => {
    const data = r.data;
    return data?.data ?? data;
  });
}

export function getTenant(id) {
  return http.get(`/tenants/${id}`).then((r) => r.data?.data ?? r.data);
}

export function createTenant(data) {
  return http.post('/tenants', data).then((r) => r.data?.data ?? r.data);
}

export function updateTenant(id, data) {
  return http.put(`/tenants/${id}`, data).then((r) => r.data?.data ?? r.data);
}

export function deleteTenant(id) {
  return http.delete(`/tenants/${id}`).then((r) => r.data?.data ?? r.data);
}
