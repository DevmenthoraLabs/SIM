import { useMemo, useState } from 'react'
import { Package } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput'
import { FloatingLabelSelect } from '@/components/ui/FloatingLabelSelect'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/input'
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
import { useBatches } from './useBatches'
import { getBatchColumns } from './batchColumns'

export default function BatchesPage() {
  const { user } = useAuth()
  const canWrite =
    user?.role === ROLES.Admin ||
    user?.role === ROLES.StockManager ||
    user?.role === ROLES.ReceivingOperator
  const canDelete = user?.role === ROLES.Admin

  const {
    batches,
    loading,
    activeMedications,
    activeSuppliers,
    selectedProductId,
    setSelectedProductId,
    serverError,
    isDialogOpen,
    form,
    openRegister,
    closeDialog,
    onSubmit,
    isSubmitting,
    deactivate,
    isDeactivating,
    reactivate,
  } = useBatches()

  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null)

  const columns = useMemo(
    () =>
      getBatchColumns({
        canDelete,
        onDeactivate: setPendingDeactivateId,
        onReactivate: reactivate,
      }),
    [canDelete, reactivate],
  )

  return (
    <PageContainer wide>
      <PageHeader
        title={messages.pages.batchesTitle}
        description={messages.pages.batchesDescription}
        actions={
          canWrite
            ? <Button onClick={openRegister}>{messages.batches.newButton}</Button>
            : undefined
        }
      />

      {/* Product filter */}
      <div className="mb-4 max-w-sm">
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder={messages.fields.selectProduto} />
          </SelectTrigger>
          <SelectContent>
            {activeMedications.map((med) => (
              <SelectItem key={med.id} value={med.id}>
                {med.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={batches}
        loading={loading}
        emptyIcon={Package}
        emptyTitle={
          selectedProductId
            ? messages.common.noData
            : messages.fields.selectProduto
        }
        emptyDescription={
          selectedProductId
            ? messages.common.noDataHint
            : undefined
        }
        emptyAction={
          selectedProductId && canWrite
            ? <Button onClick={openRegister}>{messages.batches.registerSubmit}</Button>
            : undefined
        }
      />

      {/* Register dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{messages.batches.registerDialogTitle}</DialogTitle>
            <DialogDescription>{messages.batches.registerDialogDescription}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={onSubmit}>
              <DialogBody className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelSelect
                          label={messages.fields.produto}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          {activeMedications.map((med) => (
                            <SelectItem key={med.id} value={med.id}>
                              {med.name}
                            </SelectItem>
                          ))}
                        </FloatingLabelSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelSelect
                          label={messages.fields.fornecedor}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          {activeSuppliers.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id}>
                              {sup.name}
                            </SelectItem>
                          ))}
                        </FloatingLabelSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lotNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput label={messages.fields.numeroLote} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="manufacturingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          {messages.fields.dataFabricacao} {messages.fields.opcional}
                        </FormLabel>
                        <FormControl>
                          <Input type="date" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          {messages.fields.dataValidade}
                        </FormLabel>
                        <FormControl>
                          <Input type="date" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={messages.fields.quantidade}
                            type="number"
                            min="0.0001"
                            step="any"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unitCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label={`${messages.fields.custoUnitario} ${messages.fields.opcional}`}
                            type="number"
                            min="0"
                            step="any"
                            value={field.value ?? ''}
                            onChange={field.onChange}
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
                    ? messages.batches.registerSubmitting
                    : messages.batches.registerSubmit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDeactivateId !== null}
        onOpenChange={(open) => { if (!open) setPendingDeactivateId(null) }}
        title={messages.confirm.deactivateBatchTitle}
        description={messages.confirm.deactivateBatchDescription}
        isPending={isDeactivating}
        onConfirm={() => {
          if (pendingDeactivateId) deactivate(pendingDeactivateId)
          setPendingDeactivateId(null)
        }}
      />
    </PageContainer>
  )
}
