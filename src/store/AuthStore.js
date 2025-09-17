import { defineStore } from 'pinia'
import { AuthService } from '../services/AuthService'
import {jwtDecode} from 'jwt-decode'

function safeParseUser() {
  try {
    const data = localStorage.getItem('user')
    return data && data !== 'undefined' ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: safeParseUser()
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },

  actions: {
    async login(email, password) {
      const { accessToken, refreshToken } = await AuthService.login(email, password)
      this.setSession(accessToken, refreshToken)
    },

    async refresh() {
      if (!this.refreshToken) return this.logout()
      try {
        const { accessToken } = await AuthService.refresh(this.refreshToken)
        this.accessToken = accessToken
        this.user = jwtDecode(accessToken)

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch {
        this.logout()
      }
    },

    setSession(accessToken, refreshToken) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.user = jwtDecode(accessToken)

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      localStorage.clear()
    }
  }
})
