import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  username: string
  role: string
  email?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth(requiredRole?: string) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (status === 'loading') {
      setAuthState(prev => ({ ...prev, loading: true }))
      return
    }

    if (status === 'unauthenticated' || !session?.user) {
      setAuthState({ user: null, loading: false, error: 'Not authenticated' })
      router.push('/login')
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      setAuthState({ user: null, loading: false, error: 'Insufficient permissions' })
      router.push('/login')
      return
    }

    setAuthState({
      user: {
        id: session.user.id,
        username: session.user.username,
        role: session.user.role,
        email: session.user.email
      },
      loading: false,
      error: null
    })
  }, [session, status, requiredRole, router])

  return authState
}

// Custom fetch function that includes auth headers
export async function authFetch(url: string, options: RequestInit = {}) {
  const response = await fetch('/api/auth/session')
  
  if (!response.ok) {
    throw new Error('Authentication failed')
  }
  
  const { user } = await response.json()
  
  const headers = {
    ...options.headers,
    'x-user-id': user.id,
    'x-user-role': user.role,
    'Content-Type': 'application/json'
  }
  
  return fetch(url, {
    ...options,
    headers
  })
}