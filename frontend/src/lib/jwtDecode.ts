function decodePayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1]
  const padded = base64.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(padded)) as Record<string, unknown>
}

export function extractRoleFromToken(token: string): string {
  return (decodePayload(token)['sim_role'] as string) ?? ''
}

export function extractEmailFromToken(token: string): string {
  return (decodePayload(token)['email'] as string) ?? ''
}

export function extractOrganizationIdFromToken(token: string): string {
  return (decodePayload(token)['sim_organization_id'] as string) ?? ''
}
