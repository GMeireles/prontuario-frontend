import axios from 'axios'
import { useAuthStore } from '../store/AuthStore'
import router from '../router'

const api = axios.create({
  baseURL: 'https://dev.api.prontuario.vexial.com.br/api'
})

// Intercepta requests para incluir token
api.interceptors.request.use((config) => {
  const auth = useAuthStore()

  // Garante que busca direto do localStorage se o store ainda não carregou
  const token = auth?.accessToken || localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Interceptador para erros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default api
