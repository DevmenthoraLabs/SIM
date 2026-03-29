const KEYS = {
  accessToken: 'sim_access_token',
  refreshToken: 'sim_refresh_token',
  expiresAt: 'sim_token_expires_at',
} as const

export const tokenStorage = {
  save(accessToken: string, refreshToken: string, expiresIn: number): void {
    localStorage.setItem(KEYS.accessToken, accessToken)
    localStorage.setItem(KEYS.refreshToken, refreshToken)
    localStorage.setItem(KEYS.expiresAt, String(Date.now() + expiresIn * 1000))
  },

  getAccessToken(): string | null {
    return localStorage.getItem(KEYS.accessToken)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.refreshToken)
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
