import api from './api'
import axios from 'axios'

// Supabase config for direct auth calls (forgot password, Google OAuth)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseHeaders = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
}

/**
 * Auth service — wraps /api/auth endpoints + direct Supabase calls.
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
   * Register a new account with email + password + fullName.
   * @returns {{ accessToken: string, message: string }}
   */
  register: async (email, password, fullName) => {
    const { data } = await api.post('/auth/register', { email, password, fullName })
    return data
  },

  /**
   * Forgot password — calls Supabase directly to send a password reset email.
   * Supabase handles the email sending and reset link generation.
   */
  forgotPassword: async (email) => {
    const redirectTo = `${window.location.origin}/dat-lai-mat-khau`
    const { data } = await axios.post(
      `${SUPABASE_URL}/auth/v1/recover`,
      { email },
      { 
        headers: supabaseHeaders,
        params: { redirect_to: redirectTo } // Pass via query param as required by Supabase REST
      }
    )
    return data
  },

  /**
   * Reset password using the access token from the recovery email link.
   * Calls Supabase directly.
   */
  resetPassword: async (accessToken, newPassword) => {
    const { data } = await axios.put(
      `${SUPABASE_URL}/auth/v1/user`,
      { password: newPassword },
      {
        headers: {
          ...supabaseHeaders,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    return data
  },
}

export default authService

