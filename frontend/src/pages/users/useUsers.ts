import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { ROLES, OPERATIONAL_ROLES } from '@/lib/constants'
import { messages } from '@/lib/messages'
import { queryKeys } from '@/lib/queryKeys'
import { unitService } from '@/services/unitService'
import { userService } from '@/services/userService'
import { useAuth } from '@/hooks/useAuth'

const inviteSchema = z
  .object({
    email: z.string().email(messages.validation.emailInvalid),
    fullName: z.string().min(1, messages.validation.nameRequired).max(200, messages.validation.nameTooLong),
    role: z.enum(
      [ROLES.Admin, ROLES.Pharmacist, ROLES.StockManager, ROLES.ReceivingOperator],
      { error: messages.validation.roleRequired },
    ),
    unitIds: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      OPERATIONAL_ROLES.includes(data.role as (typeof OPERATIONAL_ROLES)[number]) &&
      (!data.unitIds || data.unitIds.length === 0)
    ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['unitIds'], message: messages.validation.unitRequired })
    }
  })

type InviteFormValues = z.infer<typeof inviteSchema>

export function useUsers() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: users = [], isLoading } = useQuery({
    queryKey: queryKeys.users,
    queryFn: () => userService.getAll(),
  })

  const { data: units = [] } = useQuery({
    queryKey: queryKeys.units,
    queryFn: () => unitService.getAll(),
  })

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', fullName: '', role: ROLES.Admin, unitIds: [] },
  })

  const selectedRole = form.watch('role')
  const isOperationalRole = OPERATIONAL_ROLES.includes(selectedRole as (typeof OPERATIONAL_ROLES)[number])

  function closeDialog() {
    setIsDialogOpen(false)
    form.reset({ email: '', fullName: '', role: ROLES.Admin, unitIds: [] })
    setServerError(null)
  }

  const inviteMutation = useMutation({
    mutationFn: (values: InviteFormValues) =>
      userService.adminInvite({
        email: values.email,
        fullName: values.fullName,
        role: values.role,
        organizationId: user!.organizationId,
        unitIds: values.unitIds?.length ? values.unitIds : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      closeDialog()
      toast.success(messages.users.inviteSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.users.inviteError)),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => userService.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success(messages.users.updateRoleSuccess)
    },
    onError: (error) => toast.error(extractErrorMessage(error, messages.users.updateRoleError)),
  })

  function toggleUnit(unitId: string) {
    const current = form.getValues('unitIds') ?? []
    form.setValue(
      'unitIds',
      current.includes(unitId) ? current.filter((id) => id !== unitId) : [...current, unitId],
      { shouldValidate: true },
    )
  }

  return {
    users,
    units: units.filter((u) => u.isActive),
    loading: isLoading,
    serverError,
    isDialogOpen,
    setIsDialogOpen,
    closeDialog,
    form,
    onSubmit: form.handleSubmit((values) => inviteMutation.mutate(values)),
    isSubmitting: inviteMutation.isPending,
    isOperationalRole,
    toggleUnit,
    updateRole: (userId: string, role: string) => updateRoleMutation.mutate({ userId, role }),
    isUpdatingRole: updateRoleMutation.isPending,
  }
}
