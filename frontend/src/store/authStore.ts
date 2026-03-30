import { create } from 'zustand'
import { tokenStorage } from '../lib/tokenStorage'

export interface AuthUser {
  email: string
  role: string
  organizationId: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  signOut: () => void
}

function resolveInitialUser(): AuthUser | null {
  if (!tokenStorage.hasSession() || tokenStorage.isExpired()) return null
  const email = tokenStorage.getEmail()
  const role = tokenStorage.getRole()
  const organizationId = tokenStorage.getOrganizationId()
  return email && role && organizationId ? { email, role, organizationId } : null
}

export const useAuthStore = create<AuthState>((set) => ({
  user: resolveInitialUser(),
  isAuthenticated: resolveInitialUser() !== null,

  setUser: (user) => set({ user, isAuthenticated: user !== null }),

  signOut: () => {
    tokenStorage.clear()
    set({ user: null, isAuthenticated: false })
  },
}))
