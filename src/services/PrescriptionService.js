// services/PrescriptionService.js
import api from './api'

export default {
  async getByPatient(patientId, { page = 1, limit = 10, type } = {}) {
    const params = { page, limit }
    if (type) params.type = type

    const res = await api.get(`/prescriptions/${patientId}`, { params })
    return res.data
  },

  async create(data) {
    const res = await api.post('/prescriptions', data)
    return res.data
  },

  async update(id, data) {
    const res = await api.put(`/prescriptions/${id}`, data)
    return res.data
  },

  async remove(id) {
    const res = await api.delete(`/prescriptions/${id}`)
    return res.data
  },

  async addFile(prescriptionId, fileId) {
    const res = await api.post(`/prescriptions/${prescriptionId}/files`, { file_id: fileId })
    return res.data
  },

  async listFiles(prescriptionId) {
    const res = await api.get(`/prescriptions/${prescriptionId}/files`)
    return res.data
  },

  async removeFile(prescriptionId, fileId) {
    const res = await api.delete(`/prescriptions/${prescriptionId}/files/${fileId}`)
    return res.data
  }
}
