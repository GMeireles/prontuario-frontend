import api from './api'

export default {
  async getByPatient(patientId) {
    const res = await api.get(`/evolutions/patient/${patientId}`)
    return res.data
  },
  async create(patientId, data) {
    const res = await api.post(`/evolutions/${patientId}`, data)
    return res.data
  },
  async remove(id) {
    const res = await api.delete(`/evolutions/${id}`)
    return res.data
  }
}
