import { api } from '@/lib/api'
import { LoginResponseSchema, type LoginResponse } from '@/types'

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/api/auth/login', { email, password })
    return LoginResponseSchema.parse(data)
  },
  setPassword: (password: string) => api.post('/api/auth/set-password', { password }),
}
