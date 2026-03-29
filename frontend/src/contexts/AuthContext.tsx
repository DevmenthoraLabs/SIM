import { createContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import { tokenStorage } from '../lib/tokenStorage'

interface AuthUser {
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage on app load
    if (tokenStorage.hasSession() && !tokenStorage.isExpired()) {
      // We store the email alongside the tokens so we can restore the user object
      const email = localStorage.getItem('sim_user_email')
      if (email) setUser({ email })
    }
    setIsLoading(false)
  }, [])

  async function signIn(email: string, password: string): Promise<void> {
    const { data } = await api.post('/api/auth/login', { email, password })
    tokenStorage.save(data.accessToken, data.refreshToken, data.expiresIn)
    localStorage.setItem('sim_user_email', email)
    setUser({ email })
  }

  function signOut(): void {
    tokenStorage.clear()
    localStorage.removeItem('sim_user_email')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
