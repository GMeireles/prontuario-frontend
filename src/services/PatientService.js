import api from "./api"

export const PatientService = {
  async list() {
    const { data } = await api.get("/patients")
    return data
  },
  async create(payload) {
    const { data } = await api.post("/patients", payload)
    return data
  },
  async update(id, payload) {
    const { data } = await api.put(`/patients/${id}`, payload)
    return data
  },
  async remove(id) {
    const { data } = await api.delete(`/patients/${id}`)
    return data
  },
    async listRecent() {
    const res = await api.get('/patients/recent')
    return res.data
  },
  async get(id) {
  const res = await api.get(`/patients/${id}`)
  return res.data
}
}
