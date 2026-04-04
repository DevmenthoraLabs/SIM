import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

export default function AdminRoute() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'Admin') return <Navigate to="/" replace />

  return <Outlet />
}
