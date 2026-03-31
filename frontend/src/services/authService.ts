import { api } from '@/lib/api'

export const authService = {
  login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
  setPassword: (password: string) => api.post('/api/auth/set-password', { password }),
}
