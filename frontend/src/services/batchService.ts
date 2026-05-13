import { api } from '@/lib/api'
import type { BatchResponse, RegisterBatchRequest } from '@/types'

export const batchService = {
  getByProduct: (productId: string): Promise<BatchResponse[]> =>
    api.get(`/api/batches/product/${productId}`).then((r) => r.data),

  getById: (id: string): Promise<BatchResponse> =>
    api.get(`/api/batches/${id}`).then((r) => r.data),

  register: (data: RegisterBatchRequest): Promise<BatchResponse> =>
    api.post('/api/batches', data).then((r) => r.data),

  deactivate: (id: string): Promise<void> =>
    api.delete(`/api/batches/${id}`).then(() => undefined),

  reactivate: (id: string): Promise<void> =>
    api.put(`/api/batches/${id}/reactivate`).then(() => undefined),
}
