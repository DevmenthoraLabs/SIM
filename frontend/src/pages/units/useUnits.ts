import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { messages } from '@/lib/messages'
import { queryKeys } from '@/lib/queryKeys'
import { unitService } from '@/services/unitService'
import type { UnitResponse } from '@/types'

const unitSchema = z.object({
  name: z.string().min(1, messages.validation.unitNameRequired).max(200, messages.validation.unitNameTooLong),
  code: z.string().min(1, messages.validation.unitCodeRequired).max(20, messages.validation.unitCodeTooLong),
  address: z.string().max(500, messages.validation.unitAddressTooLong).optional(),
  phone: z.string().max(20, messages.validation.unitPhoneTooLong).optional(),
})

type UnitFormValues = z.infer<typeof unitSchema>

export function useUnits() {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
    setIsDialogOpen(true)
  }

  function openEdit(unit: UnitResponse) {
    setEditingUnit(unit)
    form.reset({ name: unit.name, code: unit.code, address: unit.address ?? '', phone: unit.phone ?? '' })
    setServerError(null)
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingUnit(null)
    setServerError(null)
  }

  const createMutation = useMutation({
    mutationFn: unitService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units })
      closeDialog()
      toast.success(messages.units.createSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.units.createError)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitFormValues }) => unitService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units })
      closeDialog()
      toast.success(messages.units.updateSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.units.updateError)),
  })

  const deactivateMutation = useMutation({
    mutationFn: unitService.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units })
      toast.success(messages.units.deactivateSuccess)
    },
    onError: (error) => toast.error(extractErrorMessage(error, messages.units.deactivateError)),
  })

  async function onSubmit(values: UnitFormValues): Promise<void> {
    setServerError(null)
    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  return {
    units,
    loading: isLoading,
    serverError,
    isDialogOpen,
    editingUnit,
    form,
    openCreate,
    openEdit,
    closeDialog,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    deactivate: (id: string) => deactivateMutation.mutate(id),
  }
}
