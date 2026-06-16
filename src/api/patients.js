import http from './http.js';

export function listPatients() {
  return http.get('/patients').then((r) => r.data);
}

export function listRecentPatients() {
  return http.get('/patients/recent').then((r) => r.data);
}

export function getPatient(id) {
  return http.get(`/patients/${id}`).then((r) => r.data);
}

export function createPatient(data) {
  return http.post('/patients', data).then((r) => r.data);
}

export function updatePatient(id, data) {
  return http.put(`/patients/${id}`, data).then((r) => r.data);
}

export function deletePatient(id) {
  return http.delete(`/patients/${id}`).then((r) => r.data);
}
