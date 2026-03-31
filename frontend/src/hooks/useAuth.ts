import { authService } from '../services/authService'
import { extractRoleFromToken, extractOrganizationIdFromToken } from '../lib/jwtDecode'
import { tokenStorage } from '../lib/tokenStorage'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, isAuthenticated, setUser, signOut } = useAuthStore()

  async function signIn(email: string, password: string): Promise<void> {
    const loginResponse = await authService.login(email, password)
    const role = extractRoleFromToken(loginResponse.accessToken)
    const organizationId = extractOrganizationIdFromToken(loginResponse.accessToken)
    tokenStorage.save(
      loginResponse.accessToken,
      loginResponse.refreshToken,
      loginResponse.expiresIn,
      email,
      role,
      organizationId
    )
    setUser({ email, role, organizationId })
  }

  return { user, isAuthenticated, signIn, signOut }
}
