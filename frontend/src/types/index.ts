import { z } from 'zod'

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  role: z.string(),
  organizationId: z.string(),
})
export type LoginResponse = z.infer<typeof LoginResponseSchema>

export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  role: z.string(),
  organizationId: z.string(),
})
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

// ── Medication ────────────────────────────────────────────────────────────────

export interface MedicationDetailsResponse {
  genericName: string | null
  activeIngredient: string | null
  presentation: string | null
  concentration: string | null
  isControlled: boolean
}

export interface MedicationResponse {
  id: string
  name: string
  description: string | null
  barCode: string | null
  categoryId: string | null
  categoryName: string | null
  createdAt: string
  isActive: boolean
  details: MedicationDetailsResponse | null
}

export interface CreateMedicationRequest {
  name: string
  description?: string
  barCode?: string
  categoryId?: string
  genericName?: string
  activeIngredient?: string
  presentation?: string
  concentration?: string
  isControlled: boolean
}

export interface UpdateMedicationRequest {
  name: string
  description?: string
  barCode?: string
  categoryId?: string
  genericName?: string
  activeIngredient?: string
  presentation?: string
  concentration?: string
  isControlled: boolean
}

// ── Category ──────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: string
  name: string
  parentId: string | null
  organizationId: string
  createdAt: string
  isActive: boolean
}

export interface CreateCategoryRequest {
  name: string
  parentId?: string
}

export interface UpdateCategoryRequest {
  name: string
  parentId?: string
}
