import { api } from '@/lib/api'
import type { InviteUserRequest, UserResponse } from '@/types'

export const userService = {
  // SuperAdmin
  invite: (data: InviteUserRequest) => api.post('/api/suporte/users', data),

  // Admin
  getAll: (): Promise<UserResponse[]> =>
    api.get('/api/users').then((r) => r.data),

  adminInvite: (data: InviteUserRequest): Promise<UserResponse> =>
    api.post('/api/users', data).then((r) => r.data),

  updateRole: (userId: string, newRole: string): Promise<void> =>
    api.patch(`/api/users/${userId}/role`, { newRole }).then(() => undefined),
}
