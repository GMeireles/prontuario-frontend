import http from './http.js';

export function listUsers(params = {}) {
  return http.get('/users', { params }).then((r) => r.data);
}

export function listProfessionals() {
  return listUsers({ role: 'professional' });
}
