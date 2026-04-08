import { api } from '@/lib/api'
import type { MedicationResponse, CreateMedicationRequest, UpdateMedicationRequest } from '@/types'

export const medicationService = {
  getAll: (): Promise<MedicationResponse[]> =>
    api.get('/api/medications').then((r) => r.data),

  getById: (id: string): Promise<MedicationResponse> =>
    api.get(`/api/medications/${id}`).then((r) => r.data),

  create: (data: CreateMedicationRequest): Promise<MedicationResponse> =>
    api.post('/api/medications', data).then((r) => r.data),

  update: (id: string, data: UpdateMedicationRequest): Promise<MedicationResponse> =>
    api.put(`/api/medications/${id}`, data).then((r) => r.data),

  deactivate: (id: string): Promise<void> =>
    api.delete(`/api/medications/${id}`).then(() => undefined),

  reactivate: (id: string): Promise<void> =>
    api.put(`/api/medications/${id}/reactivate`).then(() => undefined),
}
