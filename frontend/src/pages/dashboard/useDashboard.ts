import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { organizationService } from '@/services/organizationService'
import { unitService } from '@/services/unitService'

export function useDashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const isSuperAdmin = user?.role === 'SuperAdmin'

  const { data: units = [] } = useQuery({
    queryKey: queryKeys.units,
    queryFn: () => unitService.getAll(),
    enabled: isAdmin,
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
    activeUnits: units.filter((u) => u.isActive).length,
    totalOrganizations: organizations.length,
  }
}
