export const queryKeys = {
  organizations: ['organizations'] as const,
  units: ['units'] as const,
  unit: (id: string) => ['units', id] as const,
  unitUsers: (unitId: string) => ['units', unitId, 'users'] as const,
}
