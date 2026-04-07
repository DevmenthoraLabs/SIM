import { Tag, Pencil, Trash2 } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
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

export default function CategoriesPage() {
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
  } = useCategories()

  function getParentName(parentId: string | null): string {
    if (!parentId) return '—'
    return categories.find((c) => c.id === parentId)?.name ?? '—'
  }

  return (
    <PageContainer>
      <PageHeader
        title={messages.pages.categoriesTitle}
        description={messages.pages.categoriesDescription}
        actions={<Button onClick={openCreate}>{messages.categories.newButton}</Button>}
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <Spinner />
              <span className="text-sm text-muted-foreground">{messages.common.loading}</span>
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={Tag}
              title={messages.common.noData}
              description={messages.common.noDataHint}
              action={<Button onClick={openCreate}>{messages.categories.createSubmit}</Button>}
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.nome}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.categoriaPai}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.status}</th>
                  <th className="text-right px-4 py-3 font-medium">{messages.fields.acoes}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {getParentName(category.parentId)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        active={category.isActive}
                        activeLabel={messages.status.ativo}
                        inactiveLabel={messages.status.inativo}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {category.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(category)}
                            title={messages.categories.editButton}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {category.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deactivate(category.id)}
                            title={messages.categories.deactivateButton}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

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
                    ? editingCategory
                      ? messages.categories.updateSubmitting
                      : messages.categories.createSubmitting
                    : editingCategory
                      ? messages.categories.updateSubmit
                      : messages.categories.createSubmit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
