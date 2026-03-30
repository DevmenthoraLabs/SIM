import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

const SIM_SUPORTE_ORG_ID = '00000000-0000-0000-0000-000000000001'

export default function SuperAdminRoute() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'SuperAdmin' || user.organizationId !== SIM_SUPORTE_ORG_ID)
    return <Navigate to="/" replace />

  return <Outlet />
}
