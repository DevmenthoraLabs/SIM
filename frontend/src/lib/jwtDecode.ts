function decodePayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1]
  const padded = base64.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(padded)) as Record<string, unknown>
}

export function extractEmailFromToken(token: string): string {
  return (decodePayload(token)['email'] as string) ?? ''
}
