import http from './http.js';
import { unwrapData } from './response.js';

export function getAnamneseByPatient(patientId) {
  return http.get(`/anamneses/patient/${patientId}`).then((r) => unwrapData(r.data));
}

export function createAnamnese(patientId, data) {
  return http.post(`/anamneses/patient/${patientId}`, data).then((r) => unwrapData(r.data));
}

export function updateAnamnese(id, data) {
  return http.put(`/anamneses/${id}`, data).then((r) => unwrapData(r.data));
}

export function deleteAnamnese(id) {
  return http.delete(`/anamneses/${id}`).then((r) => unwrapData(r.data));
}

export function signAnamnese(id, payload) {
  return http.post(`/anamneses/${id}/sign`, payload).then((r) => unwrapData(r.data));
}
