import { create } from 'zustand';
import { loginUser as loginAPI } from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await loginAPI(credentials);
      const { token, user } = data;
      localStorage.setItem('authToken', token);
      set({ user, token, isLoading: false });
      return user;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
