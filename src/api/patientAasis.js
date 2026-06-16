import http from './http.js';
import { unwrapData, unwrapList } from './response.js';

export function listPatientAasis(patientId, params = {}) {
  return http.get(`/patients/${patientId}/aasis`, { params }).then((r) => unwrapList(r.data));
}

export function getPatientAasi(patientId, aasiId) {
  return http.get(`/patients/${patientId}/aasis/${aasiId}`).then((r) => unwrapData(r.data));
}

export function createPatientAasi(patientId, data) {
  return http.post(`/patients/${patientId}/aasis`, data).then((r) => unwrapData(r.data));
}

export function updatePatientAasi(patientId, aasiId, data) {
  return http.put(`/patients/${patientId}/aasis/${aasiId}`, data).then((r) => unwrapData(r.data));
}

export function deactivatePatientAasi(patientId, aasiId) {
  return http.delete(`/patients/${patientId}/aasis/${aasiId}`).then((r) => unwrapData(r.data));
}
