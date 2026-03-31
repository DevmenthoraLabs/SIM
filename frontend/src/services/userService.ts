import { api } from '@/lib/api'
import type { InviteUserRequest } from '@/types'

export const userService = {
  invite: (data: InviteUserRequest) => api.post('/api/suporte/users', data),
}
