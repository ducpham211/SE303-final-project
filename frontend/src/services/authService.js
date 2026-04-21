import api from './api'

/**
 * Auth service — wraps /api/auth endpoints.
 */
const authService = {
  /**
   * Login with email + password.
   * @returns {{ accessToken: string, message: string }}
   */
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  /**
   * Register a new account with email + password.
   * @returns {{ accessToken: string, message: string }}
   */
  register: async (email, password) => {
    const { data } = await api.post('/auth/register', { email, password })
    return data
  },
}

export default authService
