import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Central auth store — persists JWT token in localStorage.
 * Hydrated automatically on page load via zustand/middleware persist.
 */
const useAuthStore = create(
  persist(
    (set) => ({
      user: null, 
      token: null,
      isLoggedIn: false,

      /** Called after successful login/register */
      login: (token) => {
        localStorage.setItem('access_token', token)
        
        let decoded = null
        try {
          // Manual JWT decode to avoid extra dependencies
          const base64Url = token.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = decodeURIComponent(
            window.atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          decoded = JSON.parse(jsonPayload)
        } catch (e) {
          console.error('Failed to decode token', e)
        }

        set({ 
          token, 
          isLoggedIn: true,
          user: decoded ? {
            email: decoded.sub,
            role: decoded.role || decoded.roles?.[0] || 'PLAYER', // Fallback
            name: decoded.name || decoded.sub?.split('@')[0],
            // id (UUID) is populated separately by enrichUser() after /api/users/me
          } : null
        })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ user: null, token: null, isLoggedIn: false })
      },

      /**
       * Enrich user object with UUID + profile from GET /api/users/me.
       * JWT only contains email (sub), not the UUID — this fills the gap.
       * Called once on app mount when isLoggedIn is true.
       */
      enrichUser: (profile) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, id: profile.id, fullName: profile.fullName, phone: profile.phone, role: profile.role || state.user.role }
            : state.user,
        }))
      },
    }),
    {
      name: 'auth-storage',
      // We persist user info too so it's available after refresh
      partialize: (state) => ({ 
        token: state.token, 
        isLoggedIn: state.isLoggedIn,
        user: state.user 
      }),
    }
  )
)

export default useAuthStore
