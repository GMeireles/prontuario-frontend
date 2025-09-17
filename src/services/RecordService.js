import api from "./api"

export const RecordService = {
  async list(patientId) {
    const { data } = await api.get(`/records/${patientId}`)
    return data
  },
  async create(patientId, payload) {
    const { data } = await api.post(`/records/${patientId}`, payload)
    return data
  },
  async update(id, payload) {
    const { data } = await api.put(`/records/${id}`, payload)
    return data
  },
  async remove(id) {
    const { data } = await api.delete(`/records/${id}`)
    return data
  },
}
