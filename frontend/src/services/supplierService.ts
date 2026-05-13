import { api } from '@/lib/api'
import type { SupplierResponse, CreateSupplierRequest, UpdateSupplierRequest } from '@/types'

export const supplierService = {
  getAll: (): Promise<SupplierResponse[]> =>
    api.get('/api/suppliers').then((r) => r.data),

  getById: (id: string): Promise<SupplierResponse> =>
    api.get(`/api/suppliers/${id}`).then((r) => r.data),

  create: (data: CreateSupplierRequest): Promise<SupplierResponse> =>
    api.post('/api/suppliers', data).then((r) => r.data),

  update: (id: string, data: UpdateSupplierRequest): Promise<SupplierResponse> =>
    api.put(`/api/suppliers/${id}`, data).then((r) => r.data),

  deactivate: (id: string): Promise<void> =>
    api.delete(`/api/suppliers/${id}`).then(() => undefined),

  reactivate: (id: string): Promise<void> =>
    api.put(`/api/suppliers/${id}/reactivate`).then(() => undefined),
}
