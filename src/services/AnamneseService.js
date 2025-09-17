import api from './api'

export default {
  async getByPatient(patientId) {
    const res = await api.get(`/anamneses/patient/${patientId}`)
    return res.data
  },
  async create(patientId, payload) {
    const { data } = await api.post(`/anamneses/patient/${patientId}`, payload)
    return data
  },
  async update(id, data) {
    const res = await api.put(`/anamneses/${id}`, data)
    return res.data
  },
  async remove(id) {
    const res = await api.delete(`/anamneses/${id}`)
    return res.data
  }
}
