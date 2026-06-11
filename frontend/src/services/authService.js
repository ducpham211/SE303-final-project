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
   * Register a new account with email + password + fullName + otp.
   * @returns {{ accessToken: string, message: string }}
   */
  register: async (email, password, fullName, otp) => {
    const { data } = await api.post('/auth/register', { email, password, fullName, otp })
    return data
  },

  /**
   * Send registration OTP to email.
   * @returns {{ message: string }}
   */
  sendRegisterOtp: async (email) => {
    const { data } = await api.post('/auth/send-register-otp', { email })
    return data
  },

  /**
   * Forgot password — calls backend API to send an OTP via email.
   */
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email })
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

  /**
   * Reset password using OTP from backend.
   */
  resetPasswordOTP: async (email, otp, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { email, otp, newPassword })
    return data
  },
}

export default authService

