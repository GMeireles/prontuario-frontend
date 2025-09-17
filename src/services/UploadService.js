import api from './api'

export default {
  async listByPatient(patientId) {
    const res = await api.get(`/uploads/patient/${patientId}`)
    return res.data
  },
  async upload(patientId, file) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post(`/uploads/${patientId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },
  async remove(id) {
    const res = await api.delete(`/uploads/${id}`)
    return res.data
  }
}
