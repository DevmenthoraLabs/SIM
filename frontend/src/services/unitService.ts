import { api } from '@/lib/api'
import type { CreateUnitRequest, UnitResponse, UpdateUnitRequest, UserResponse } from '@/types'

export const unitService = {
  getAll: (): Promise<UnitResponse[]> =>
    api.get('/api/units').then((r) => r.data),

  getById: (id: string): Promise<UnitResponse> =>
    api.get(`/api/units/${id}`).then((r) => r.data),

  create: (data: CreateUnitRequest): Promise<UnitResponse> =>
    api.post('/api/units', data).then((r) => r.data),

  update: (id: string, data: UpdateUnitRequest): Promise<UnitResponse> =>
    api.put(`/api/units/${id}`, data).then((r) => r.data),

  deactivate: (id: string): Promise<void> =>
    api.delete(`/api/units/${id}`).then(() => undefined),

  getUsers: (unitId: string): Promise<UserResponse[]> =>
    api.get(`/api/units/${unitId}/users`).then((r) => r.data),

  assignUser: (unitId: string, userId: string): Promise<void> =>
    api.post(`/api/units/${unitId}/users/${userId}`).then(() => undefined),

  removeUser: (unitId: string, userId: string): Promise<void> =>
    api.delete(`/api/units/${unitId}/users/${userId}`).then(() => undefined),
}
