import axios from 'axios'
import { tokenStorage } from './tokenStorage'
import { useAuthStore } from '../store/authStore'
import { RefreshResponseSchema } from '@/types'

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('Missing VITE_API_URL environment variable. Check your .env file.')
}

// Separate instance used only for token refresh to avoid circular interceptor calls
const authClient = axios.create({ baseURL: apiUrl, timeout: 15_000 })

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.detail) {
    return error.response.data.detail
  }
  return fallback
}

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// Inject Bearer token on every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401: attempt one token refresh, then retry the original request.
// Uses a queue to prevent multiple simultaneous refresh calls.
let isRefreshing = false
let queue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = []

function processQueue(error: unknown, token: string | null): void {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  queue = []
}

function expireSession(): void {
  tokenStorage.clear()
  useAuthStore.getState().signOut()
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retried) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) {
      expireSession()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retried = true
    isRefreshing = true

    try {
      const { data } = await authClient.post('/api/auth/refresh', { refreshToken })
      const parsed = RefreshResponseSchema.parse(data)
      const email = tokenStorage.getEmail() ?? ''
      tokenStorage.save(
        parsed.accessToken,
        parsed.refreshToken,
        parsed.expiresIn,
        email,
        parsed.role,
        parsed.organizationId
      )
      useAuthStore.getState().setUser({ email, role: parsed.role, organizationId: parsed.organizationId })
      processQueue(null, parsed.accessToken)
      originalRequest.headers.Authorization = `Bearer ${parsed.accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      expireSession()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
