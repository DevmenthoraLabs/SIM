import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { messages } from '@/lib/messages'
import { queryKeys } from '@/lib/queryKeys'
import { medicationService } from '@/services/medicationService'
import { categoryService } from '@/services/categoryService'
import type { MedicationResponse } from '@/types'

const medicationSchema = z.object({
  name: z
    .string()
    .min(1, messages.validation.medicationNameRequired)
    .max(200, messages.validation.medicationNameTooLong),
  description: z.string().max(1000, messages.validation.medicationDescriptionTooLong).optional(),
  barCode: z.string().max(50, messages.validation.medicationBarCodeTooLong).optional(),
  categoryId: z.string().optional(),
  genericName: z.string().max(300, messages.validation.medicationGenericNameTooLong).optional(),
  activeIngredient: z.string().max(300, messages.validation.medicationActiveIngredientTooLong).optional(),
  presentation: z.string().max(100, messages.validation.medicationPresentationTooLong).optional(),
  concentration: z.string().max(50, messages.validation.medicationConcentrationTooLong).optional(),
  isControlled: z.enum(['true', 'false']),
})

type MedicationFormValues = z.infer<typeof medicationSchema>

const defaultValues: MedicationFormValues = {
  name: '',
  description: '',
  barCode: '',
  categoryId: 'none',
  genericName: '',
  activeIngredient: '',
  presentation: '',
  concentration: '',
  isControlled: 'false',
}

export function useMedications() {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<MedicationResponse | null>(null)

  const { data: medications = [], isLoading } = useQuery({
    queryKey: queryKeys.medications,
    queryFn: () => medicationService.getAll(),
  })

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoryService.getAll(),
  })

  const activeCategories = categories.filter((c) => c.isActive)

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues,
  })

  function openCreate() {
    setEditingMedication(null)
    form.reset(defaultValues)
    setServerError(null)
    setIsDialogOpen(true)
  }

  function openEdit(medication: MedicationResponse) {
    setEditingMedication(medication)
    form.reset({
      name: medication.name,
      description: medication.description ?? '',
      barCode: medication.barCode ?? '',
      categoryId: medication.categoryId ?? 'none',
      genericName: medication.details?.genericName ?? '',
      activeIngredient: medication.details?.activeIngredient ?? '',
      presentation: medication.details?.presentation ?? '',
      concentration: medication.details?.concentration ?? '',
      isControlled: medication.details?.isControlled ? 'true' : 'false',
    })
    setServerError(null)
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingMedication(null)
    setServerError(null)
  }

  const createMutation = useMutation({
    mutationFn: medicationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications })
      closeDialog()
      toast.success(messages.medications.createSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.medications.createError)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof medicationService.update>[1] }) =>
      medicationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications })
      closeDialog()
      toast.success(messages.medications.updateSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.medications.updateError)),
  })

  const deactivateMutation = useMutation({
    mutationFn: medicationService.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications })
      toast.success(messages.medications.deactivateSuccess)
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, messages.medications.deactivateError)),
  })

  const reactivateMutation = useMutation({
    mutationFn: medicationService.reactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications })
      toast.success(messages.medications.reactivateSuccess)
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, messages.medications.reactivateError)),
  })

  async function onSubmit(values: MedicationFormValues): Promise<void> {
    setServerError(null)
    const payload = {
      name: values.name,
      description: values.description || undefined,
      barCode: values.barCode || undefined,
      categoryId: values.categoryId && values.categoryId !== 'none' ? values.categoryId : undefined,
      genericName: values.genericName || undefined,
      activeIngredient: values.activeIngredient || undefined,
      presentation: values.presentation || undefined,
      concentration: values.concentration || undefined,
      isControlled: values.isControlled === 'true',
    }
    if (editingMedication) {
      updateMutation.mutate({ id: editingMedication.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return {
    medications,
    loading: isLoading,
    activeCategories,
    serverError,
    isDialogOpen,
    editingMedication,
    form,
    openCreate,
    openEdit,
    closeDialog,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    deactivate: (id: string) => deactivateMutation.mutate(id),
    isDeactivating: deactivateMutation.isPending,
    reactivate: (id: string) => reactivateMutation.mutate(id),
  }
}
