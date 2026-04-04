import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { organizationService } from '@/services/organizationService'
import { unitService } from '@/services/unitService'
import { userService } from '@/services/userService'

const OPERATIONAL_ROLES = ['Pharmacist', 'StockManager', 'ReceivingOperator'] as const

const inviteSchema = z
  .object({
    email: z.string().email('Email inválido.'),
    fullName: z.string().min(1, 'Nome completo é obrigatório.').max(200, 'Nome muito longo.'),
    role: z.enum(['SuperAdmin', 'Admin', 'Pharmacist', 'StockManager', 'ReceivingOperator'], {
      error: 'Perfil é obrigatório.',
    }),
    organizationId: z.string().min(1, 'Selecione uma organização.'),
    unitIds: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      OPERATIONAL_ROLES.includes(data.role as (typeof OPERATIONAL_ROLES)[number]) &&
      (!data.unitIds || data.unitIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['unitIds'],
        message: 'Selecione ao menos uma unidade para este perfil.',
      })
    }
  })

type InviteFormValues = z.infer<typeof inviteSchema>

export function useInviteUser() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: organizations = [] } = useQuery({
    queryKey: queryKeys.organizations,
    queryFn: () => organizationService.getAll(),
  })

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', fullName: '', role: 'Admin', organizationId: '', unitIds: [] },
  })

  const selectedOrganizationId = form.watch('organizationId')
  const selectedRole = form.watch('role')
  const isOperationalRole = OPERATIONAL_ROLES.includes(selectedRole as (typeof OPERATIONAL_ROLES)[number])

  const { data: units = [] } = useQuery({
    queryKey: queryKeys.units,
    queryFn: () => unitService.getAll(),
    enabled: isOperationalRole && !!selectedOrganizationId,
  })

  const inviteMutation = useMutation({
    mutationFn: (values: InviteFormValues) =>
      userService.invite({
        email: values.email,
        fullName: values.fullName,
        role: values.role,
        organizationId: values.organizationId,
        unitIds: values.unitIds?.length ? values.unitIds : undefined,
      }),
    onSuccess: () => {
      setSuccess(true)
      setServerError(null)
      form.reset()
      toast.success('Convite enviado com sucesso.')
    },
    onError: (error) => {
      setServerError(
        extractErrorMessage(error, 'Erro ao enviar convite. Verifique os dados e tente novamente.')
      )
    },
  })

  async function onSubmit(values: InviteFormValues): Promise<void> {
    setServerError(null)
    inviteMutation.mutate(values)
  }

  return {
    organizations,
    units,
    isOperationalRole,
    serverError,
    success,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: inviteMutation.isPending,
    goBack: () => navigate('/suporte/organizations'),
  }
}
