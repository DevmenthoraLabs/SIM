import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/constants'
import { queryKeys } from '@/lib/queryKeys'
import { organizationService } from '@/services/organizationService'
import { unitService } from '@/services/unitService'

export function useDashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === ROLES.Admin
  const isSuperAdmin = user?.role === ROLES.SuperAdmin
  const isOperational = !!user && !isAdmin && !isSuperAdmin

  const { data: units = [] } = useQuery({
    queryKey: queryKeys.units,
    queryFn: () => unitService.getAll(),
    enabled: isAdmin || isOperational,
  })

  const { data: organizations = [] } = useQuery({
    queryKey: queryKeys.organizations,
    queryFn: () => organizationService.getAll(),
    enabled: isSuperAdmin,
  })

  return {
    user,
    isAdmin,
    isSuperAdmin,
    isOperational,
    activeUnits: units.filter((u) => u.isActive),
    totalOrganizations: organizations.length,
  }
}
