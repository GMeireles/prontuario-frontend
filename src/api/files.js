import http from './http.js';
import { unwrapData, unwrapList } from './response.js';

export function uploadFile(formData) {
  return http.post('/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => unwrapData(r.data));
}

export function listFilesByPatient(patientId) {
  return http.get(`/files/${patientId}`).then((r) => unwrapList(r.data));
}

export async function downloadFile(fileId, filename = 'arquivo') {
  const res = await http.get(`/files/${fileId}/download`, { responseType: 'blob' });
  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function deleteFile(fileId) {
  return http.delete(`/files/${fileId}`).then((r) => unwrapData(r.data));
}
