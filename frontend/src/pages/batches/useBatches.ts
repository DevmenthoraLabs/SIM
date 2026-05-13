import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { messages } from '@/lib/messages'
import { queryKeys } from '@/lib/queryKeys'
import { batchService } from '@/services/batchService'
import { medicationService } from '@/services/medicationService'
import { supplierService } from '@/services/supplierService'

const batchSchema = z
  .object({
    productId: z.string().min(1, messages.validation.batchProductRequired),
    supplierId: z.string().min(1, messages.validation.batchSupplierRequired),
    lotNumber: z
      .string()
      .min(1, messages.validation.batchLotNumberRequired)
      .max(100, messages.validation.batchLotNumberTooLong),
    manufacturingDate: z.string().optional(),
    expiryDate: z.string().min(1, messages.validation.batchExpiryDateRequired),
    quantity: z.string().min(1, messages.validation.batchQuantityPositive),
    unitCost: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.manufacturingDate || !data.expiryDate || data.manufacturingDate < data.expiryDate,
    { message: messages.validation.batchManufacturingBeforeExpiry, path: ['manufacturingDate'] },
  )
  .refine(
    (data) => {
      const qty = parseFloat(data.quantity)
      return !isNaN(qty) && qty > 0
    },
    { message: messages.validation.batchQuantityPositive, path: ['quantity'] },
  )
  .refine(
    (data) => {
      if (!data.unitCost || data.unitCost === '') return true
      const cost = parseFloat(data.unitCost)
      return !isNaN(cost) && cost >= 0
    },
    { message: messages.validation.batchUnitCostNonNegative, path: ['unitCost'] },
  )

type BatchFormValues = z.infer<typeof batchSchema>

const defaultValues: BatchFormValues = {
  productId: '',
  supplierId: '',
  lotNumber: '',
  manufacturingDate: '',
  expiryDate: '',
  quantity: '',
  unitCost: '',
}

export function useBatches() {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')

  const { data: medications = [] } = useQuery({
    queryKey: queryKeys.medications,
    queryFn: () => medicationService.getAll(),
  })

  const { data: suppliers = [] } = useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: () => supplierService.getAll(),
  })

  const { data: batches = [], isLoading } = useQuery({
    queryKey: queryKeys.batchesByProduct(selectedProductId),
    queryFn: () => batchService.getByProduct(selectedProductId),
    enabled: Boolean(selectedProductId),
  })

  const activeMedications = medications.filter((m) => m.isActive)
  const activeSuppliers = suppliers.filter((s) => s.isActive)

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues,
  })

  function openRegister() {
    form.reset(defaultValues)
    setServerError(null)
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setServerError(null)
  }

  const registerMutation = useMutation({
    mutationFn: batchService.register,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.batchesByProduct(data.productId) })
      closeDialog()
      toast.success(messages.batches.registerSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.batches.registerError)),
  })

  const deactivateMutation = useMutation({
    mutationFn: batchService.deactivate,
    onSuccess: () => {
      if (selectedProductId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.batchesByProduct(selectedProductId) })
      }
      toast.success(messages.batches.deactivateSuccess)
    },
    onError: (error) => toast.error(extractErrorMessage(error, messages.batches.deactivateError)),
  })

  const reactivateMutation = useMutation({
    mutationFn: batchService.reactivate,
    onSuccess: () => {
      if (selectedProductId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.batchesByProduct(selectedProductId) })
      }
      toast.success(messages.batches.reactivateSuccess)
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, messages.batches.reactivateError)),
  })

  async function onSubmit(values: BatchFormValues): Promise<void> {
    setServerError(null)
    registerMutation.mutate({
      productId: values.productId,
      supplierId: values.supplierId,
      lotNumber: values.lotNumber,
      manufacturingDate: values.manufacturingDate || undefined,
      expiryDate: values.expiryDate,
      quantity: parseFloat(values.quantity),
      unitCost: values.unitCost ? parseFloat(values.unitCost) : undefined,
    })
  }

  return {
    batches,
    loading: isLoading && Boolean(selectedProductId),
    activeMedications,
    activeSuppliers,
    selectedProductId,
    setSelectedProductId,
    serverError,
    isDialogOpen,
    form,
    openRegister,
    closeDialog,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: registerMutation.isPending,
    deactivate: (id: string) => deactivateMutation.mutate(id),
    isDeactivating: deactivateMutation.isPending,
    reactivate: (id: string) => reactivateMutation.mutate(id),
  }
}
