import { useParams, useNavigate } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { unitService } from '@/services/unitService'

export function useUnitUsers() {
  const { unitId = '' } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: unit } = useQuery({
    queryKey: queryKeys.unit(unitId),
    queryFn: () => unitService.getById(unitId),
    enabled: !!unitId,
  })

  const { data: users = [], isLoading } = useQuery({
    queryKey: queryKeys.unitUsers(unitId),
    queryFn: () => unitService.getUsers(unitId),
    enabled: !!unitId,
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) => unitService.removeUser(unitId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.unitUsers(unitId) })
      toast.success('Usuário removido da unidade.')
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, 'Erro ao remover usuário da unidade.'))
    },
  })

  return {
    unit,
    users,
    loading: isLoading,
    removeUser: (userId: string) => removeMutation.mutate(userId),
    isRemoving: removeMutation.isPending,
    goBack: () => navigate('/units'),
  }
}
