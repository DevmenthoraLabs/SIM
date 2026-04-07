import { authService } from '../services/authService'
import { tokenStorage } from '../lib/tokenStorage'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, isAuthenticated, setUser, signOut } = useAuthStore()

  async function signIn(email: string, password: string): Promise<void> {
    const loginResponse = await authService.login(email, password)
    tokenStorage.save(
      loginResponse.accessToken,
      loginResponse.refreshToken,
      loginResponse.expiresIn,
      email,
      loginResponse.role,
      loginResponse.organizationId
    )
    setUser({ email, role: loginResponse.role, organizationId: loginResponse.organizationId })
  }

  return { user, isAuthenticated, signIn, signOut }
}
