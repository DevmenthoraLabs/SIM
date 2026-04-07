import { api } from '@/lib/api'
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@/types'

export const categoryService = {
  getAll: (): Promise<CategoryResponse[]> =>
    api.get('/api/categories').then((r) => r.data),

  getById: (id: string): Promise<CategoryResponse> =>
    api.get(`/api/categories/${id}`).then((r) => r.data),

  create: (data: CreateCategoryRequest): Promise<CategoryResponse> =>
    api.post('/api/categories', data).then((r) => r.data),

  update: (id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> =>
    api.put(`/api/categories/${id}`, data).then((r) => r.data),

  deactivate: (id: string): Promise<void> =>
    api.delete(`/api/categories/${id}`).then(() => undefined),
}
