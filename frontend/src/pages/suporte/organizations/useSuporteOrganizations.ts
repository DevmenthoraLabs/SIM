import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { organizationService } from '@/services/organizationService'

const createOrgSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.').max(200, 'Nome muito longo.'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos numéricos.'),
  type: z.enum(['Public', 'Private'], { error: 'Tipo é obrigatório.' }),
})

type CreateOrgFormValues = z.infer<typeof createOrgSchema>

export function useSuporteOrganizations() {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: queryKeys.organizations,
    queryFn: () => organizationService.getAll().then((r) => r.data),
  })

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: '', cnpj: '', type: 'Private' },
  })

  const createMutation = useMutation({
    mutationFn: organizationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations })
      form.reset()
      setShowForm(false)
      setServerError(null)
      toast.success('Organização criada com sucesso.')
    },
    onError: (error) => {
      setServerError(extractErrorMessage(error, 'Erro ao criar organização. Verifique os dados e tente novamente.'))
    },
  })

  async function onSubmit(values: CreateOrgFormValues): Promise<void> {
    setServerError(null)
    createMutation.mutate(values)
  }

  return {
    organizations,
    loading: isLoading,
    serverError,
    showForm,
    setShowForm,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createMutation.isPending,
  }
}
