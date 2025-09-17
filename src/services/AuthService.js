import api from './api'

export const AuthService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    return data // retorna { token, user }
  }
}
