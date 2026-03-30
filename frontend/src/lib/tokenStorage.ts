const KEYS = {
  accessToken: 'sim_access_token',
  refreshToken: 'sim_refresh_token',
  expiresAt: 'sim_token_expires_at',
  userEmail: 'sim_user_email',
  userRole: 'sim_user_role',
  organizationId: 'sim_organization_id',
} as const

export const tokenStorage = {
  save(accessToken: string, refreshToken: string, expiresIn: number, email: string, role: string, organizationId: string): void {
    localStorage.setItem(KEYS.accessToken, accessToken)
    localStorage.setItem(KEYS.refreshToken, refreshToken)
    localStorage.setItem(KEYS.expiresAt, String(Date.now() + expiresIn * 1000))
    localStorage.setItem(KEYS.userEmail, email)
    localStorage.setItem(KEYS.userRole, role)
    localStorage.setItem(KEYS.organizationId, organizationId)
  },

  getAccessToken(): string | null {
    return localStorage.getItem(KEYS.accessToken)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.refreshToken)
  },

  getEmail(): string | null {
    return localStorage.getItem(KEYS.userEmail)
  },

  getRole(): string | null {
    return localStorage.getItem(KEYS.userRole)
  },

  getOrganizationId(): string | null {
    return localStorage.getItem(KEYS.organizationId)
  },

  isExpired(): boolean {
    const expiresAt = localStorage.getItem(KEYS.expiresAt)
    if (!expiresAt) return true
    return Date.now() > Number(expiresAt)
  },

  hasSession(): boolean {
    return localStorage.getItem(KEYS.accessToken) !== null
  },

  clear(): void {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  },
}
