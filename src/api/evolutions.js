import http from './http.js';
import { unwrapData, unwrapList } from './response.js';

export function listEvolutionsByPatient(patientId) {
  return http.get(`/evolutions/patient/${patientId}`).then((r) => unwrapList(r.data));
}

export function createEvolution(patientId, data) {
  return http.post(`/evolutions/patient/${patientId}`, data).then((r) => unwrapData(r.data));
}

export function updateEvolution(id, data) {
  return http.put(`/evolutions/${id}`, data).then((r) => unwrapData(r.data));
}

export function deleteEvolution(id) {
  return http.delete(`/evolutions/${id}`).then((r) => unwrapData(r.data));
}
