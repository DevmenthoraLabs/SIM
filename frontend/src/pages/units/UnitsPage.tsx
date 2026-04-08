import { useMemo, useState } from 'react'
import { Building2 } from 'lucide-react'
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
import { useUnits } from './useUnits'
import { getUnitColumns } from './unitColumns'

export default function UnitsPage() {
  const {
    units, loading, serverError,
    isDialogOpen, editingUnit, form,
    openCreate, openEdit, closeDialog,
    onSubmit, isSubmitting, deactivate, isDeactivating,
  } = useUnits()

  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null)

  const columns = useMemo(
    () => getUnitColumns({
      onEdit: openEdit,
      onDeactivate: setPendingDeactivateId,
    }),
    [openEdit],
  )

  return (
    <PageContainer wide>
      <PageHeader
        title={messages.pages.unitsTitle}
        description={messages.pages.unitsDescription}
        actions={<Button onClick={openCreate}>{messages.units.newButton}</Button>}
      />

      <DataTable
        columns={columns}
        data={units}
        loading={loading}
        emptyIcon={Building2}
        emptyTitle={messages.common.noData}
        emptyDescription={messages.common.noDataHint}
        emptyAction={<Button onClick={openCreate}>{messages.units.createSubmit}</Button>}
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUnit
                ? `${messages.units.editDialogTitle} — ${editingUnit.name}`
                : messages.units.createDialogTitle}
            </DialogTitle>
            {!editingUnit && <DialogDescription>{messages.units.createDialogDescription}</DialogDescription>}
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <DialogBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormControl><FloatingLabelInput label={messages.fields.nome} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem>
                      <FormControl><FloatingLabelInput label={messages.fields.codigo} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput label={`${messages.fields.endereco} ${messages.fields.opcional}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput label={`${messages.fields.telefone} ${messages.fields.opcional}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeDialog}>{messages.common.cancel}</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingUnit ? messages.units.updateSubmitting : messages.units.createSubmitting
                    : editingUnit ? messages.units.updateSubmit : messages.units.createSubmit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDeactivateId !== null}
        onOpenChange={(open) => { if (!open) setPendingDeactivateId(null) }}
        title={messages.confirm.deactivateUnitTitle}
        description={messages.confirm.deactivateUnitDescription}
        isPending={isDeactivating}
        onConfirm={() => {
          if (pendingDeactivateId) deactivate(pendingDeactivateId)
          setPendingDeactivateId(null)
        }}
      />
    </PageContainer>
  )
}
