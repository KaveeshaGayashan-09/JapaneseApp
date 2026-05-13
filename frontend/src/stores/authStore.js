import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isNewUser: false,

      setAuth: (token, refreshToken, user, isNewUser = false) =>
        set({ token, refreshToken, user, isNewUser }),

      setUser: (user) => set({ user }),

      logout: () => {
        set({ token: null, refreshToken: null, user: null, isNewUser: false })
        window.location.href = '/'
      },

      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'ADMIN',
      isVerified: () => get().user?.status === 'VERIFIED' || get().user?.role === 'ADMIN',
    }),
    { name: 'nihongo-auth' }
  )
)
