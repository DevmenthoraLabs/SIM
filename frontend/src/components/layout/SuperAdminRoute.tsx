import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { SYSTEM } from '@/lib/constants'

export default function SuperAdminRoute() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'SuperAdmin' || user.organizationId !== SYSTEM.SIM_SUPORTE_ORG_ID)
    return <Navigate to="/" replace />

  return <Outlet />
}
