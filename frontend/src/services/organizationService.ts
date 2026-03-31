import { api } from '@/lib/api'
import type { OrganizationResponse, CreateOrganizationRequest } from '@/types'

export const organizationService = {
  getAll: () => api.get<OrganizationResponse[]>('/api/suporte/organizations'),
  create: (data: CreateOrganizationRequest) => api.post<OrganizationResponse>('/api/suporte/organizations', data),
}
