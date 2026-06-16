import http from './http.js';
import { unwrapList } from './response.js';

export function listUsers(params = {}) {
  return http.get('/users', { params }).then((r) => unwrapList(r.data));
}

export function listProfessionals() {
  return http.get('/users/professionals').then((r) => unwrapList(r.data));
}
