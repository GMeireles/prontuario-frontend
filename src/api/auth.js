import http from './http.js';
import { unwrapData } from './response.js';

export function login(email, password) {
  return http.post('/auth/login', { email, password }).then((r) => unwrapData(r.data));
}

export function refresh(refreshToken) {
  return http.post('/auth/refresh', { refreshToken }).then((r) => unwrapData(r.data));
}

export function logout(refreshToken) {
  return http.post('/auth/logout', { refreshToken }).then((r) => unwrapData(r.data));
}

export function getMe() {
  return http.get('/auth/me').then((r) => unwrapData(r.data));
}
