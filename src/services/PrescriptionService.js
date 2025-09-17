import api from './api'

export default {
  async getByPatient(patientId) {
    const res = await api.get(`/prescriptions/patient/${patientId}`)
    return res.data
  },
  async create(patientId, data) {
    const res = await api.post(`/prescriptions/${patientId}`, data)
    return res.data
  },
  async remove(id) {
    const res = await api.delete(`/prescriptions/${id}`)
    return res.data
  }
}
