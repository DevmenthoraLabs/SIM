import { z } from 'zod'
import { api } from '@/lib/api'
import {
  OrganizationResponseSchema,
  type OrganizationResponse,
  type CreateOrganizationRequest,
} from '@/types'

export const organizationService = {
  getAll: async (): Promise<OrganizationResponse[]> => {
    const { data } = await api.get('/api/suporte/organizations')
    return z.array(OrganizationResponseSchema).parse(data)
  },
  create: async (body: CreateOrganizationRequest): Promise<OrganizationResponse> => {
    const { data } = await api.post('/api/suporte/organizations', body)
    return OrganizationResponseSchema.parse(data)
  },
}
