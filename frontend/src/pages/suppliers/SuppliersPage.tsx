import { useMemo, useState } from 'react'
import { Truck } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput'
import { DataTable } from '@/components/ui/DataTable'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import PageContainer from '@/components/layout/PageContainer'
import PageHeader from '@/components/layout/PageHeader'
import { messages } from '@/lib/messages'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/constants'
import { useSuppliers } from './useSuppliers'
import { getSupplierColumns } from './supplierColumns'

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export default function SuppliersPage() {
  const { user } = useAuth()
  const canWrite = user?.role === ROLES.Admin || user?.role === ROLES.StockManager
  const canDelete = user?.role === ROLES.Admin

  const {
    suppliers,
    loading,
    serverError,
    isDialogOpen,
    editingSupplier,
    form,
    openCreate,
    openEdit,
    closeDialog,
    onSubmit,
    isSubmitting,
    deactivate,
    isDeactivating,
    reactivate,
  } = useSuppliers()

  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null)

  const columns = useMemo(
    () =>
      getSupplierColumns({
        canWrite,
        canDelete,
        onEdit: openEdit,
        onDeactivate: setPendingDeactivateId,
        onReactivate: reactivate,
      }),
    [canWrite, canDelete, openEdit, reactivate],
  )

  return (
    <PageContainer wide>
      <PageHeader
        title={messages.pages.suppliersTitle}
        description={messages.pages.suppliersDescription}
        actions={
          canWrite
            ? <Button onClick={openCreate}>{messages.suppliers.newButton}</Button>
            : undefined
        }
      />

      <DataTable
        columns={columns}
        data={suppliers}
        loading={loading}
        emptyIcon={Truck}
        emptyTitle={messages.common.noData}
        emptyDescription={messages.common.noDataHint}
        emptyAction={
          canWrite
            ? <Button onClick={openCreate}>{messages.suppliers.createSubmit}</Button>
            : undefined
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier
                ? `${messages.suppliers.editDialogTitle} — ${editingSupplier.name}`
                : messages.suppliers.createDialogTitle}
            </DialogTitle>
            {!editingSupplier && (
              <DialogDescription>{messages.suppliers.createDialogDescription}</DialogDescription>
            )}
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={onSubmit}>
              <DialogBody className="space-y-5">
                <SectionDivider label={messages.suppliers.sectionIdentification} />

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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={messages.fields.cnpj}
                            placeholder={messages.fields.placeholderCnpj}
                            maxLength={14}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.telefone} ${messages.fields.opcional}`}
                            placeholder={messages.fields.placeholderTelefone}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.email} ${messages.fields.opcional}`}
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.contato} ${messages.fields.opcional}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <SectionDivider label={messages.suppliers.sectionAddress} />

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label={`${messages.fields.rua} ${messages.fields.opcional}`}
                          placeholder={messages.fields.placeholderEndereco}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.cidade} ${messages.fields.opcional}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.estado} ${messages.fields.opcional}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.cep} ${messages.fields.opcional}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              </DialogBody>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeDialog}>
                  {messages.common.cancel}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingSupplier
                      ? messages.suppliers.updateSubmitting
                      : messages.suppliers.createSubmitting
                    : editingSupplier
                      ? messages.suppliers.updateSubmit
                      : messages.suppliers.createSubmit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDeactivateId !== null}
        onOpenChange={(open) => { if (!open) setPendingDeactivateId(null) }}
        title={messages.confirm.deactivateSupplierTitle}
        description={messages.confirm.deactivateSupplierDescription}
        isPending={isDeactivating}
        onConfirm={() => {
          if (pendingDeactivateId) deactivate(pendingDeactivateId)
          setPendingDeactivateId(null)
        }}
      />
    </PageContainer>
  )
}
