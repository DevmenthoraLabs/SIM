import { useState } from 'react'
import { Link } from 'react-router'
import { Building2, Pencil, Trash2, Users } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
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

export default function UnitsPage() {
  const {
    units, loading, serverError,
    isDialogOpen, editingUnit, form,
    openCreate, openEdit, closeDialog,
    onSubmit, isSubmitting, deactivate, isDeactivating,
  } = useUnits()

  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null)

  return (
    <PageContainer>
      <PageHeader
        title={messages.pages.unitsTitle}
        description={messages.pages.unitsDescription}
        actions={<Button onClick={openCreate}>{messages.units.newButton}</Button>}
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <Spinner />
              <span className="text-sm text-muted-foreground">{messages.common.loading}</span>
            </div>
          ) : units.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={messages.common.noData}
              description={messages.common.noDataHint}
              action={<Button onClick={openCreate}>{messages.units.createSubmit}</Button>}
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.nome}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.codigo}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.telefone}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.status}</th>
                  <th className="text-right px-4 py-3 font-medium">{messages.fields.acoes}</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{unit.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{unit.code}</td>
                    <td className="px-4 py-3 text-muted-foreground">{unit.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={unit.isActive} activeLabel={messages.status.ativa} inactiveLabel={messages.status.inativa} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild title={messages.units.viewUsersButton}>
                          <Link to={`/units/${unit.id}/users`}><Users className="h-4 w-4" /></Link>
                        </Button>
                        {unit.isActive && (
                          <Button variant="ghost" size="sm" onClick={() => openEdit(unit)} title={messages.units.editButton}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {unit.isActive && (
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => setPendingDeactivateId(unit.id)}
                            title={messages.units.deactivateButton}
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
                    <FormControl><FloatingLabelInput label={`${messages.fields.endereco} ${messages.fields.opcional}`} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormControl><FloatingLabelInput label={`${messages.fields.telefone} ${messages.fields.opcional}`} {...field} /></FormControl>
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
