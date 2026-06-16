import http from './http.js';
import { parseApiResponse, unwrapData } from './response.js';

export function listPrescriptionsByPatient(patientId, params = {}) {
  return http.get(`/prescriptions/${patientId}`, { params }).then((r) => parseApiResponse(r.data));
}

export function createPrescription(data) {
  return http.post('/prescriptions', data).then((r) => unwrapData(r.data));
}

export function updatePrescription(id, data) {
  return http.put(`/prescriptions/${id}`, data).then((r) => unwrapData(r.data));
}

export function deletePrescription(id) {
  return http.delete(`/prescriptions/${id}`).then((r) => unwrapData(r.data));
}

export function addPrescriptionFile(prescriptionId, fileId) {
  return http.post(`/prescriptions/${prescriptionId}/files`, { file_id: fileId }).then((r) => unwrapData(r.data));
}

export function listPrescriptionFiles(prescriptionId) {
  return http.get(`/prescriptions/${prescriptionId}/files`).then((r) => unwrapData(r.data));
}

export function removePrescriptionFile(prescriptionId, fileId) {
  return http.delete(`/prescriptions/${prescriptionId}/files/${fileId}`).then((r) => unwrapData(r.data));
}
