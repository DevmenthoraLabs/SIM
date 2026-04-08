import { useMemo, useState } from 'react'
import { Pill } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput'
import { FloatingLabelSelect } from '@/components/ui/FloatingLabelSelect'
import { SelectItem } from '@/components/ui/select'
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
import { useMedications } from './useMedications'
import { getMedicationColumns } from './medicationColumns'

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

export default function MedicationsPage() {
  const { user } = useAuth()
  const canWrite = user?.role === ROLES.Admin || user?.role === ROLES.StockManager
  const canDelete = user?.role === ROLES.Admin

  const {
    medications,
    loading,
    activeCategories,
    serverError,
    isDialogOpen,
    editingMedication,
    form,
    openCreate,
    openEdit,
    closeDialog,
    onSubmit,
    isSubmitting,
    deactivate,
    isDeactivating,
    reactivate,
  } = useMedications()

  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null)

  const columns = useMemo(
    () => getMedicationColumns({
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
        title={messages.pages.medicationsTitle}
        description={messages.pages.medicationsDescription}
        actions={
          canWrite
            ? <Button onClick={openCreate}>{messages.medications.newButton}</Button>
            : undefined
        }
      />

      <DataTable
        columns={columns}
        data={medications}
        loading={loading}
        emptyIcon={Pill}
        emptyTitle={messages.common.noData}
        emptyDescription={messages.common.noDataHint}
        emptyAction={
          canWrite
            ? <Button onClick={openCreate}>{messages.medications.createSubmit}</Button>
            : undefined
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMedication
                ? `${messages.medications.editDialogTitle} — ${editingMedication.name}`
                : messages.medications.createDialogTitle}
            </DialogTitle>
            {!editingMedication && (
              <DialogDescription>{messages.medications.createDialogDescription}</DialogDescription>
            )}
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <DialogBody className="space-y-5">
                <SectionDivider label={messages.medications.sectionProduct} />
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
                    name="barCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.codigoBarras} ${messages.fields.opcional}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelSelect
                            label={messages.fields.categoria}
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectItem value="none">{messages.medications.noCategory}</SelectItem>
                            {activeCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </FloatingLabelSelect>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <SectionDivider label={messages.medications.sectionDetails} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="genericName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.nomeGenerico} ${messages.fields.opcional}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="activeIngredient"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.principioAtivo} ${messages.fields.opcional}`}
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
                    name="presentation"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.apresentacao} ${messages.fields.opcional}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="concentration"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.concentracao} ${messages.fields.opcional}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isControlled"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3">
                        <FormLabel className="text-sm text-muted-foreground">
                          {messages.fields.controlado}
                        </FormLabel>
                        <div className="flex rounded-lg border border-input overflow-hidden text-xs">
                          {(['false', 'true'] as const).map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => field.onChange(val)}
                              className={
                                field.value === val
                                  ? 'px-4 py-1.5 font-medium bg-primary text-primary-foreground transition-colors'
                                  : 'px-4 py-1.5 text-muted-foreground transition-colors hover:bg-muted'
                              }
                            >
                              {val === 'true' ? messages.medications.yes : messages.medications.no}
                            </button>
                          ))}
                        </div>
                      </div>
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
                    ? editingMedication ? messages.medications.updateSubmitting : messages.medications.createSubmitting
                    : editingMedication ? messages.medications.updateSubmit : messages.medications.createSubmit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDeactivateId !== null}
        onOpenChange={(open) => { if (!open) setPendingDeactivateId(null) }}
        title={messages.confirm.deactivateMedicationTitle}
        description={messages.confirm.deactivateMedicationDescription}
        isPending={isDeactivating}
        onConfirm={() => {
          if (pendingDeactivateId) deactivate(pendingDeactivateId)
          setPendingDeactivateId(null)
        }}
      />
    </PageContainer>
  )
}
