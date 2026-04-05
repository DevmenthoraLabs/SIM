import { Link } from 'react-router'
import { Pencil, Trash2, Users } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PageContainer from '@/components/layout/PageContainer'
import { messages } from '@/lib/messages'
import { useUnits } from './useUnits'

export default function UnitsPage() {
  const {
    units, loading, serverError,
    isDialogOpen, editingUnit, form,
    openCreate, openEdit, closeDialog,
    onSubmit, isSubmitting, deactivate,
  } = useUnits()

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Unidades</h1>
        <Button onClick={openCreate}>Nova unidade</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{messages.common.loading}</p>
          ) : units.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{messages.common.noData}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Nome</th>
                  <th className="text-left py-2 font-medium">Código</th>
                  <th className="text-left py-2 font-medium">Telefone</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{unit.name}</td>
                    <td className="py-2 font-mono text-xs">{unit.code}</td>
                    <td className="py-2 text-muted-foreground">{unit.phone ?? '—'}</td>
                    <td className="py-2">
                      <span className={`text-xs font-medium ${unit.isActive ? 'text-green-600' : 'text-destructive'}`}>
                        {unit.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild title="Ver usuários">
                          <Link to={`/units/${unit.id}/users`}><Users className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(unit)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {unit.isActive && (
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => deactivate(unit.id)}
                            title="Desativar"
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
              {editingUnit ? `Editar — ${editingUnit.name}` : 'Nova unidade'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl><Input placeholder="Farmácia Central" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl><Input placeholder="FAR-01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl><Input placeholder="Rua das Flores, 123" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                  <FormControl><Input placeholder="(11) 91234-5678" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>{messages.common.cancel}</Button>
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
    </PageContainer>
  )
}
