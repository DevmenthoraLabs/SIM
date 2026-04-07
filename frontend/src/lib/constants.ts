export const SYSTEM = {
  SIM_SUPORTE_ORG_ID: '00000000-0000-0000-0000-000000000001',
} as const

export const ROLES = {
  SuperAdmin: 'SuperAdmin',
  Admin: 'Admin',
  Pharmacist: 'Pharmacist',
  StockManager: 'StockManager',
  ReceivingOperator: 'ReceivingOperator',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  SuperAdmin: 'Super Admin',
  Admin: 'Admin',
  Pharmacist: 'Farmacêutico',
  StockManager: 'Gestor de Estoque',
  ReceivingOperator: 'Operador de Recebimento',
}

export const OPERATIONAL_ROLES: Role[] = [
  ROLES.Pharmacist,
  ROLES.StockManager,
  ROLES.ReceivingOperator,
]
