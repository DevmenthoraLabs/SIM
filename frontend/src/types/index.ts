import { z } from 'zod'

const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
})

export const LoginResponseSchema = TokenResponseSchema
export type LoginResponse = z.infer<typeof LoginResponseSchema>

export const RefreshResponseSchema = TokenResponseSchema
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>

export const OrganizationResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  cnpj: z.string(),
  type: z.enum(['Public', 'Private']),
  createdAt: z.string(),
  isActive: z.boolean(),
})

export type OrganizationResponse = z.infer<typeof OrganizationResponseSchema>

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
