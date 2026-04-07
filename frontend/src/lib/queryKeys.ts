export const queryKeys = {
  organizations: ['organizations'] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  units: ['units'] as const,
  unit: (id: string) => ['units', id] as const,
  unitUsers: (unitId: string) => ['units', unitId, 'users'] as const,
  categories: ['categories'] as const,
  category: (id: string) => ['categories', id] as const,
}
