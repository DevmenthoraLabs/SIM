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
  id: z.string(),
  name: z.string(),
  cnpj: z.string(),
  type: z.enum(['Public', 'Private']),
  createdAt: z.string(),
  isActive: z.boolean(),
})

export type OrganizationResponse = z.infer<typeof OrganizationResponseSchema>

export interface CreateOrganizationRequest {
  name: string
  cnpj: string
  type: 'Public' | 'Private'
}

// ── User ─────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string
  fullName: string
  email: string
  role: string
  organizationId: string
  unitIds: string[]
  createdAt: string
  isActive: boolean
}

export interface InviteUserRequest {
  email: string
  fullName: string
  role: string
  organizationId: string
  unitIds?: string[]
}

// ── Unit ─────────────────────────────────────────────────────────────────────

export interface UnitResponse {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  organizationId: string
  createdAt: string
  isActive: boolean
}

export interface CreateUnitRequest {
  name: string
  code: string
  address?: string
  phone?: string
}

export interface UpdateUnitRequest {
  name: string
  code: string
  address?: string
  phone?: string
}
