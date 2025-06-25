import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthSession, User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (session: AuthSession) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateUser: (user: Partial<User>) => void
  verifyToken: () => Promise<boolean>
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (session: AuthSession) => {
        set({
          user: {
            ...session.user,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          token: session.token,
          isAuthenticated: true,
          isLoading: false
        })
      },

      logout: () => {
        // Clear all auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        // Clear localStorage
        localStorage.removeItem('auth-storage')
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      },

      verifyToken: async () => {
        const { token, user } = get()
        if (!token || !user) {
          return false
        }

        try {
          const endpoint = user.role === 'STUDENT' ? '/api/students/me' : '/api/auth/verify'
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            return true
          } else {
            // Token tidak valid, logout
            get().logout()
            return false
          }
        } catch (error) {
          console.error('Token verification failed:', error)
          get().logout()
          return false
        }
      },

      initializeAuth: async () => {
        const { token, user, isAuthenticated } = get()
        
        if (token && user && isAuthenticated) {
          set({ isLoading: true })
          const isValid = await get().verifyToken()
          set({ isLoading: false })
          
          if (!isValid) {
            console.log('Token expired or invalid, user logged out')
            // Clear localStorage to prevent infinite loops
            localStorage.removeItem('auth-storage')
          }
        } else {
          // If no valid session data, ensure clean state
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)