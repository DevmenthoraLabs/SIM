import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { OrganizationResponse } from '@/types'

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
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([])
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', fullName: '', role: 'Admin', organizationId: '' },
  })

  useEffect(() => {
    api.get<OrganizationResponse[]>('/api/suporte/organizations')
      .then(({ data }) => setOrganizations(data))
  }, [])

  async function onSubmit(values: InviteFormValues): Promise<void> {
    try {
      setServerError(null)
      await api.post('/api/suporte/users', values)
      setSuccess(true)
      form.reset()
    } catch {
      setServerError('Erro ao enviar convite. Verifique os dados e tente novamente.')
    }
  }

  return {
    organizations,
    serverError,
    success,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    goBack: () => navigate('/suporte/organizations'),
  }
}
