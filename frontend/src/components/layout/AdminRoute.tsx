import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/constants'

export default function AdminRoute() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== ROLES.Admin) return <Navigate to="/" replace />

  return <Outlet />
}
