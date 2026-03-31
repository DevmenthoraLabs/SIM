import { extractErrorMessage } from '../lib/api'
import { authService } from '../services/authService'
import { extractRoleFromToken, extractOrganizationIdFromToken } from '../lib/jwtDecode'
import { tokenStorage } from '../lib/tokenStorage'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, isAuthenticated, setUser, signOut } = useAuthStore()

  async function signIn(email: string, password: string): Promise<void> {
    const { data } = await authService.login(email, password)
    const role = extractRoleFromToken(data.accessToken)
    const organizationId = extractOrganizationIdFromToken(data.accessToken)
    tokenStorage.save(data.accessToken, data.refreshToken, data.expiresIn, email, role, organizationId)
    setUser({ email, role, organizationId })
  }

  return { user, isAuthenticated, signIn, signOut }
}
