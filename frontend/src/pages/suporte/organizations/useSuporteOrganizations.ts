import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import type { OrganizationResponse } from '@/types'

const createOrgSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.').max(200, 'Nome muito longo.'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos numéricos.'),
  type: z.enum(['Public', 'Private'], { required_error: 'Tipo é obrigatório.' }),
})

type CreateOrgFormValues = z.infer<typeof createOrgSchema>

export function useSuporteOrganizations() {
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: '', cnpj: '', type: 'Private' },
  })

  useEffect(() => {
    api.get<OrganizationResponse[]>('/api/suporte/organizations')
      .then(({ data }) => setOrganizations(data))
      .finally(() => setLoading(false))
  }, [])

  async function onSubmit(values: CreateOrgFormValues): Promise<void> {
    try {
      setServerError(null)
      const { data } = await api.post<OrganizationResponse>('/api/suporte/organizations', values)
      setOrganizations((prev) => [data, ...prev])
      form.reset()
      setShowForm(false)
    } catch {
      setServerError('Erro ao criar organização. Verifique os dados e tente novamente.')
    }
  }

  return {
    organizations,
    loading,
    serverError,
    showForm,
    setShowForm,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  }
}
