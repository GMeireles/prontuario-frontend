import http from './http.js';
import { unwrapData, unwrapList, unwrapPaginated } from './response.js';

export function listPatients(params = {}) {
  return http.get('/patients', { params }).then((r) => unwrapPaginated(r.data));
}

export function listRecentPatients() {
  return http.get('/patients/recent').then((r) => unwrapList(r.data));
}

export function getPatient(id) {
  return http.get(`/patients/${id}`).then((r) => unwrapData(r.data));
}

export function getPatientSummary(id) {
  return http.get(`/patients/${id}/summary`).then((r) => unwrapData(r.data));
}

export function createPatient(data) {
  return http.post('/patients', data).then((r) => unwrapData(r.data));
}

export function updatePatient(id, data) {
  return http.put(`/patients/${id}`, data).then((r) => unwrapData(r.data));
}

export function archivePatient(id) {
  return http.delete(`/patients/${id}`).then((r) => unwrapData(r.data));
}

/** @deprecated use archivePatient */
export const deletePatient = archivePatient;
