import http from './http.js';

export function login(email, password) {
  return http.post('/auth/login', { email, password }).then((r) => r.data);
}

export function refresh(refreshToken) {
  return http.post('/auth/refresh', { refreshToken }).then((r) => r.data);
}

export function logout(refreshToken) {
  return http.post('/auth/logout', { refreshToken }).then((r) => r.data);
}

export function getMe() {
  return http.get('/auth/me').then((r) => r.data);
}
