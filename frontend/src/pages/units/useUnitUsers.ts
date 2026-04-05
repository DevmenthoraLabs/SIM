import { useState } from 'react'
import { useParams } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { extractErrorMessage } from '@/lib/api'
import { messages } from '@/lib/messages'
import { queryKeys } from '@/lib/queryKeys'
import { unitService } from '@/services/unitService'
import { userService } from '@/services/userService'

export function useUnitUsers() {
  const { unitId = '' } = useParams<{ unitId: string }>()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

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

  const { data: orgUsers = [] } = useQuery({
    queryKey: queryKeys.users,
    queryFn: () => userService.getAll(),
  })

  const assignedIds = new Set(users.map((u) => u.id))
  const availableUsers = orgUsers.filter((u) => u.isActive && !assignedIds.has(u.id))

  function closeDialog() {
    setIsDialogOpen(false)
    setSelectedUserId('')
  }

  const removeMutation = useMutation({
    mutationFn: (userId: string) => unitService.removeUser(unitId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.unitUsers(unitId) })
      toast.success(messages.users.removedFromUnit)
    },
    onError: (error) => toast.error(extractErrorMessage(error, messages.users.removeFromUnitError)),
  })

  const assignMutation = useMutation({
    mutationFn: (userId: string) => unitService.assignUser(unitId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.unitUsers(unitId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      closeDialog()
      toast.success(messages.users.assignToUnitSuccess)
    },
    onError: (error) => toast.error(extractErrorMessage(error, messages.users.assignToUnitError)),
  })

  return {
    unit,
    users,
    loading: isLoading,
    availableUsers,
    isDialogOpen,
    setIsDialogOpen,
    closeDialog,
    selectedUserId,
    setSelectedUserId,
    removeUser: (userId: string) => removeMutation.mutate(userId),
    isRemoving: removeMutation.isPending,
    assignUser: () => { if (selectedUserId) assignMutation.mutate(selectedUserId) },
    isAssigning: assignMutation.isPending,
  }
}
