import api from "./api";

export const UserService = {
  async list(params = {}) {
    const { data } = await api.get("/users", { params });
    return data;
  },

  async listProfessionals() {
    return this.list({ role: "professional" });
  }
};
