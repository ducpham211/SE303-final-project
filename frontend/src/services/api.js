import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle expired / invalid token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      // Avoid redirect loop — don't intercept the login endpoint itself
      !error.config?.url?.includes('/auth/')
    ) {
      localStorage.removeItem('access_token')
      // useAuthStore cannot be imported here (circular dep risk), so we clear
      // the persisted Zustand key directly and force a hard redirect.
      try {
        const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        if (stored.state) {
          stored.state.token = null
          stored.state.isLoggedIn = false
          stored.state.user = null
          localStorage.setItem('auth-storage', JSON.stringify(stored))
        }
      } catch {
        // ignore parsing errors
      }
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
