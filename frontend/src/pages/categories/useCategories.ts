import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { messages } from '@/lib/messages'
import { queryKeys } from '@/lib/queryKeys'
import { categoryService } from '@/services/categoryService'
import type { CategoryResponse } from '@/types'

const categorySchema = z.object({
  name: z
    .string()
    .min(1, messages.validation.categoryNameRequired)
    .max(100, messages.validation.categoryNameTooLong),
  parentId: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export function useCategories() {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoryService.getAll(),
  })

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', parentId: '' },
  })

  function openCreate() {
    setEditingCategory(null)
    form.reset({ name: '', parentId: 'none' })
    setServerError(null)
    setIsDialogOpen(true)
  }

  function openEdit(category: CategoryResponse) {
    setEditingCategory(category)
    form.reset({ name: category.name, parentId: category.parentId ?? 'none' })
    setServerError(null)
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setServerError(null)
  }

  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      closeDialog()
      toast.success(messages.categories.createSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.categories.createError)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      closeDialog()
      toast.success(messages.categories.updateSuccess)
    },
    onError: (error) => setServerError(extractErrorMessage(error, messages.categories.updateError)),
  })

  const deactivateMutation = useMutation({
    mutationFn: categoryService.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      toast.success(messages.categories.deactivateSuccess)
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, messages.categories.deactivateError)),
  })

  async function onSubmit(values: CategoryFormValues): Promise<void> {
    setServerError(null)
    const payload: UpdateCategoryPayload = {
      name: values.name,
      parentId: values.parentId === 'none' || !values.parentId ? undefined : values.parentId,
    }
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return {
    categories,
    loading: isLoading,
    serverError,
    isDialogOpen,
    editingCategory,
    form,
    openCreate,
    openEdit,
    closeDialog,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    deactivate: (id: string) => deactivateMutation.mutate(id),
  }
}

interface UpdateCategoryPayload {
  name: string
  parentId?: string
}
