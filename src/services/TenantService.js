import api from "./api";

export const TenantService = {
  async list() {
    const { data } = await api.get("/tenants");
    return data.data;
  },

  async get(id) {
    const { data } = await api.get(`/tenants/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post("/tenants", payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/tenants/${id}`, payload);
    return data.data;
  },

  async remove(id) {
    const { data } = await api.delete(`/tenants/${id}`);
    return data.data;
  },
};
