import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { messages } from '@/lib/messages'
import { queryKeys } from '@/lib/queryKeys'
import { organizationService } from '@/services/organizationService'

const createOrgSchema = z.object({
  name: z.string().min(1, messages.validation.unitNameRequired).max(200, messages.validation.unitNameTooLong),
  cnpj: z.string().regex(/^\d{14}$/, messages.validation.cnpjInvalid),
  type: z.enum(['Public', 'Private'], { error: messages.validation.orgTypeRequired }),
})

type CreateOrgFormValues = z.infer<typeof createOrgSchema>

export function useSuporteOrganizations() {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: queryKeys.organizations,
    queryFn: () => organizationService.getAll(),
  })

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: '', cnpj: '', type: 'Private' },
  })

  function closeDialog() {
    setIsDialogOpen(false)
    form.reset()
    setServerError(null)
  }

  const createMutation = useMutation({
    mutationFn: organizationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations })
      closeDialog()
      toast.success(messages.organizations.createSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.organizations.createError)),
  })

  return {
    organizations,
    loading: isLoading,
    serverError,
    isDialogOpen,
    setIsDialogOpen,
    closeDialog,
    form,
    onSubmit: form.handleSubmit((values) => createMutation.mutate(values)),
    isSubmitting: createMutation.isPending,
  }
}
