import http from './http.js';

export function getAnamneseByPatient(patientId) {
  return http.get(`/anamneses/patient/${patientId}`).then((r) => r.data);
}

export function createAnamnese(patientId, data) {
  return http.post(`/anamneses/patient/${patientId}`, data).then((r) => r.data);
}

export function updateAnamnese(id, data) {
  return http.put(`/anamneses/${id}`, data).then((r) => r.data);
}

export function deleteAnamnese(id) {
  return http.delete(`/anamneses/${id}`).then((r) => r.data);
}
