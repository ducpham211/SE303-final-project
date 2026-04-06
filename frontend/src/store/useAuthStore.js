import { create } from 'zustand'

/**
 * Central auth store — tracks the logged-in user.
 * In a real app this would hydrate from localStorage / JWT validation.
 */
const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,

  // For demo: toggle between logged-in and logged-out states
  login: (userData) => set({ user: userData, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
}))

export default useAuthStore
