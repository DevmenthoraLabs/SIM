import { useMemo, useState } from 'react'
import { Tag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/constants'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PageContainer from '@/components/layout/PageContainer'
import PageHeader from '@/components/layout/PageHeader'
import { messages } from '@/lib/messages'
import { useCategories } from './useCategories'
import { getCategoryColumns } from './categoryColumns'

export default function CategoriesPage() {
  const { user } = useAuth()
  const canWrite = user?.role === ROLES.Admin || user?.role === ROLES.StockManager
  const canDelete = user?.role === ROLES.Admin

  const {
    categories,
    loading,
    serverError,
    isDialogOpen,
    editingCategory,
    form,
    openCreate,
    openEdit,
    closeDialog,
    onSubmit,
    isSubmitting,
    deactivate,
    isDeactivating,
    reactivate,
  } = useCategories()

  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null)

  const columns = useMemo(
    () => getCategoryColumns({
      allCategories: categories,
      canWrite,
      canDelete,
      onEdit: openEdit,
      onDeactivate: setPendingDeactivateId,
      onReactivate: reactivate,
    }),
    [categories, canWrite, canDelete, openEdit, reactivate],
  )

  return (
    <PageContainer wide>
      <PageHeader
        title={messages.pages.categoriesTitle}
        description={messages.pages.categoriesDescription}
        actions={
          canWrite
            ? <Button onClick={openCreate}>{messages.categories.newButton}</Button>
            : undefined
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyIcon={Tag}
        emptyTitle={messages.common.noData}
        emptyDescription={messages.common.noDataHint}
        emptyAction={
          canWrite
            ? <Button onClick={openCreate}>{messages.categories.createSubmit}</Button>
            : undefined
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory
                ? `${messages.categories.editDialogTitle} — ${editingCategory.name}`
                : messages.categories.createDialogTitle}
            </DialogTitle>
            {!editingCategory && (
              <DialogDescription>{messages.categories.createDialogDescription}</DialogDescription>
            )}
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <DialogBody className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput label={messages.fields.nome} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeDialog}>
                  {messages.common.cancel}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingCategory ? messages.categories.updateSubmitting : messages.categories.createSubmitting
                    : editingCategory ? messages.categories.updateSubmit : messages.categories.createSubmit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDeactivateId !== null}
        onOpenChange={(open) => { if (!open) setPendingDeactivateId(null) }}
        title={messages.confirm.deactivateCategoryTitle}
        description={messages.confirm.deactivateCategoryDescription}
        isPending={isDeactivating}
        onConfirm={() => {
          if (pendingDeactivateId) deactivate(pendingDeactivateId)
          setPendingDeactivateId(null)
        }}
      />
    </PageContainer>
  )
}
