import http from './http.js';

export function listAppointments() {
  return http.get('/appointments').then((r) => r.data);
}

export function listTodayAppointments() {
  return http.get('/appointments/today').then((r) => r.data);
}

export function createAppointment(data) {
  return http.post('/appointments', data).then((r) => r.data);
}

export function updateAppointment(id, data) {
  return http.put(`/appointments/${id}`, data).then((r) => r.data);
}

export function deleteAppointment(id) {
  return http.delete(`/appointments/${id}`).then((r) => r.data);
}
