// services/FileService.js
import api from './api'

export default {
  async upload(formData) {
    const res = await api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  async listByPatient(patientId) {
    const res = await api.get(`/files/${patientId}`)
    return res.data
  },

  async download(fileId, filename = 'arquivo') {
    const res = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    })
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  },

  async remove(fileId) {
    const res = await api.delete(`/files/${fileId}`)
    return res.data
  }
}
