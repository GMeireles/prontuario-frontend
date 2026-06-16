import http from './http.js';
import { unwrapData } from './response.js';

export function listPatientSignatures(patientId) {
  return http.get(`/patients/${patientId}/signatures`).then((r) => unwrapData(r.data));
}

export function getSignature(id) {
  return http.get(`/signatures/${id}`).then((r) => unwrapData(r.data));
}
