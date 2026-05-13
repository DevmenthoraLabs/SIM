import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { messages } from '@/lib/messages'
import { queryKeys } from '@/lib/queryKeys'
import { supplierService } from '@/services/supplierService'
import type { SupplierResponse } from '@/types'

const supplierSchema = z.object({
  name: z
    .string()
    .min(1, messages.validation.supplierNameRequired)
    .max(200, messages.validation.supplierNameTooLong),
  cnpj: z
    .string()
    .min(1, messages.validation.supplierCnpjRequired)
    .regex(/^\d{14}$/, messages.validation.supplierCnpjInvalid),
  phone: z.string().max(20, messages.validation.supplierPhoneTooLong).optional(),
  email: z
    .string()
    .max(200, messages.validation.supplierEmailTooLong)
    .email(messages.validation.supplierEmailInvalid)
    .optional()
    .or(z.literal('')),
  contactName: z.string().max(200, messages.validation.supplierContactNameTooLong).optional(),
  street: z.string().max(200, messages.validation.supplierStreetTooLong).optional(),
  city: z.string().max(100, messages.validation.supplierCityTooLong).optional(),
  state: z.string().max(50, messages.validation.supplierStateTooLong).optional(),
  zipCode: z.string().max(20, messages.validation.supplierZipCodeTooLong).optional(),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

const defaultValues: SupplierFormValues = {
  name: '',
  cnpj: '',
  phone: '',
  email: '',
  contactName: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
}

export function useSuppliers() {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<SupplierResponse | null>(null)

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: () => supplierService.getAll(),
  })

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues,
  })

  function openCreate() {
    setEditingSupplier(null)
    form.reset(defaultValues)
    setServerError(null)
    setIsDialogOpen(true)
  }

  function openEdit(supplier: SupplierResponse) {
    setEditingSupplier(supplier)
    form.reset({
      name: supplier.name,
      cnpj: supplier.cnpj,
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      contactName: supplier.contactName ?? '',
      street: supplier.street ?? '',
      city: supplier.city ?? '',
      state: supplier.state ?? '',
      zipCode: supplier.zipCode ?? '',
    })
    setServerError(null)
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingSupplier(null)
    setServerError(null)
  }

  const createMutation = useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers })
      closeDialog()
      toast.success(messages.suppliers.createSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.suppliers.createError)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof supplierService.update>[1] }) =>
      supplierService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers })
      closeDialog()
      toast.success(messages.suppliers.updateSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.suppliers.updateError)),
  })

  const deactivateMutation = useMutation({
    mutationFn: supplierService.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers })
      toast.success(messages.suppliers.deactivateSuccess)
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, messages.suppliers.deactivateError)),
  })

  const reactivateMutation = useMutation({
    mutationFn: supplierService.reactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers })
      toast.success(messages.suppliers.reactivateSuccess)
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, messages.suppliers.reactivateError)),
  })

  async function onSubmit(values: SupplierFormValues): Promise<void> {
    setServerError(null)
    const payload = {
      name: values.name,
      cnpj: values.cnpj,
      phone: values.phone || undefined,
      email: values.email || undefined,
      contactName: values.contactName || undefined,
      street: values.street || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      zipCode: values.zipCode || undefined,
    }
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return {
    suppliers,
    loading: isLoading,
    serverError,
    isDialogOpen,
    editingSupplier,
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
