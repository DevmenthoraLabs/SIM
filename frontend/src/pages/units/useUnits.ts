import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { unitService } from '@/services/unitService'
import type { UnitResponse } from '@/types'

const unitSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.').max(200, 'Nome muito longo.'),
  code: z.string().min(1, 'Código é obrigatório.').max(20, 'Código deve ter no máximo 20 caracteres.'),
  address: z.string().max(500, 'Endereço muito longo.').optional(),
  phone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres.').optional(),
})

type UnitFormValues = z.infer<typeof unitSchema>

export function useUnits() {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingUnit, setEditingUnit] = useState<UnitResponse | null>(null)

  const { data: units = [], isLoading } = useQuery({
    queryKey: queryKeys.units,
    queryFn: () => unitService.getAll(),
  })

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: '', code: '', address: '', phone: '' },
  })

  function openCreate() {
    setEditingUnit(null)
    form.reset({ name: '', code: '', address: '', phone: '' })
    setServerError(null)
    setShowForm(true)
  }

  function openEdit(unit: UnitResponse) {
    setEditingUnit(unit)
    form.reset({
      name: unit.name,
      code: unit.code,
      address: unit.address ?? '',
      phone: unit.phone ?? '',
    })
    setServerError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingUnit(null)
    setServerError(null)
  }

  const createMutation = useMutation({
    mutationFn: unitService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units })
      closeForm()
      toast.success('Unidade criada com sucesso.')
    },
    onError: (error) => {
      setServerError(extractErrorMessage(error, 'Erro ao criar unidade.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitFormValues }) =>
      unitService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units })
      closeForm()
      toast.success('Unidade atualizada com sucesso.')
    },
    onError: (error) => {
      setServerError(extractErrorMessage(error, 'Erro ao atualizar unidade.'))
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: unitService.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units })
      toast.success('Unidade desativada.')
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, 'Erro ao desativar unidade.'))
    },
  })

  async function onSubmit(values: UnitFormValues): Promise<void> {
    setServerError(null)
    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return {
    units,
    loading: isLoading,
    serverError,
    showForm,
    editingUnit,
    form,
    openCreate,
    openEdit,
    closeForm,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    deactivate: (id: string) => deactivateMutation.mutate(id),
    isDeactivating: deactivateMutation.isPending,
  }
}
