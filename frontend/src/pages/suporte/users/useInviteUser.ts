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
import { userService } from '@/services/userService'

const inviteSchema = z.object({
  email: z.string().email('Email inválido.'),
  fullName: z.string().min(1, 'Nome completo é obrigatório.').max(200, 'Nome muito longo.'),
  role: z.enum(
    ['SuperAdmin', 'Admin', 'Pharmacist', 'StockManager', 'ReceivingOperator'],
    { error: 'Perfil é obrigatório.' }
  ),
  organizationId: z.string().uuid('Selecione uma organização.'),
})

type InviteFormValues = z.infer<typeof inviteSchema>

export function useInviteUser() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: organizations = [] } = useQuery({
    queryKey: queryKeys.organizations,
    queryFn: () => organizationService.getAll().then((r) => r.data),
  })

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', fullName: '', role: 'Admin', organizationId: '' },
  })

  const inviteMutation = useMutation({
    mutationFn: userService.invite,
    onSuccess: () => {
      setSuccess(true)
      setServerError(null)
      form.reset()
      toast.success('Convite enviado com sucesso.')
    },
    onError: (error) => {
      setServerError(extractErrorMessage(error, 'Erro ao enviar convite. Verifique os dados e tente novamente.'))
    },
  })

  async function onSubmit(values: InviteFormValues): Promise<void> {
    setServerError(null)
    inviteMutation.mutate(values)
  }

  return {
    organizations,
    serverError,
    success,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: inviteMutation.isPending,
    goBack: () => navigate('/suporte/organizations'),
  }
}
