export interface OrganizationResponse {
  id: string
  name: string
  cnpj: string
  type: 'Public' | 'Private'
  createdAt: string
  isActive: boolean
}

export interface InviteUserRequest {
  email: string
  fullName: string
  role: string
  organizationId: string
  unitId?: string
}

export interface CreateOrganizationRequest {
  name: string
  cnpj: string
  type: 'Public' | 'Private'
}
