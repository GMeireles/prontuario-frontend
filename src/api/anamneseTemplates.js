import http from './http.js';
import { unwrapData } from './response.js';

export function listAnamneseTemplates(params = {}) {
  return http.get('/anamnese-templates', { params }).then((r) => unwrapData(r.data));
}

export function getAnamneseTemplate(id) {
  return http.get(`/anamnese-templates/${id}`).then((r) => unwrapData(r.data));
}

export function createAnamneseTemplate(data) {
  return http.post('/anamnese-templates', data).then((r) => unwrapData(r.data));
}

export function updateAnamneseTemplate(id, data) {
  return http.put(`/anamnese-templates/${id}`, data).then((r) => unwrapData(r.data));
}

export function deleteAnamneseTemplate(id) {
  return http.delete(`/anamnese-templates/${id}`).then((r) => unwrapData(r.data));
}

export function addTemplateField(templateId, data) {
  return http.post(`/anamnese-templates/${templateId}/fields`, data).then((r) => unwrapData(r.data));
}

export function updateTemplateField(templateId, fieldId, data) {
  return http.put(`/anamnese-templates/${templateId}/fields/${fieldId}`, data).then((r) => unwrapData(r.data));
}

export function deleteTemplateField(templateId, fieldId) {
  return http.delete(`/anamnese-templates/${templateId}/fields/${fieldId}`).then((r) => unwrapData(r.data));
}
