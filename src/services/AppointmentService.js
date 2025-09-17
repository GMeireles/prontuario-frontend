import api from "./api";

export const AppointmentService = {
  async list() {
    const { data } = await api.get("/appointments");
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/appointments", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/appointments/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/appointments/${id}`);
    return data;
  },

  async listToday() {
    const { data } = await api.get("/appointments/today");
    return data;
  }
};
