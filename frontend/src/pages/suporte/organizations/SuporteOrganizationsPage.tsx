import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { useSuporteOrganizations } from './useSuporteOrganizations'

export default function SuporteOrganizationsPage() {
  const {
    organizations, loading, serverError,
    isDialogOpen, setIsDialogOpen, closeDialog,
    form, onSubmit, isSubmitting,
  } = useSuporteOrganizations()

  return (
    <PageContainer wide>
      <PageHeader
        title={messages.pages.organizationsTitle}
        description={messages.pages.organizationsDescription}
        actions={<Button onClick={() => setIsDialogOpen(true)}>{messages.organizations.newButton}</Button>}
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <Spinner />
              <span className="text-sm text-muted-foreground">{messages.common.loading}</span>
            </div>
          ) : organizations.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title={messages.common.noData}
              description={messages.common.noDataHint}
              action={<Button onClick={() => setIsDialogOpen(true)}>{messages.organizations.createSubmit}</Button>}
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.nome}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.cnpj}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.tipo}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.status}</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{org.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{org.cnpj}</td>
                    <td className="px-4 py-3">{org.type === 'Public' ? messages.organizations.typePublica : messages.organizations.typePrivada}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={org.isActive} activeLabel={messages.status.ativa} inactiveLabel={messages.status.inativa} />
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
            <DialogTitle>{messages.organizations.dialogTitle}</DialogTitle>
            <DialogDescription>{messages.organizations.dialogDescription}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <DialogBody className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormControl><FloatingLabelInput label={messages.fields.nome} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="cnpj" render={({ field }) => (
                    <FormItem>
                      <FormControl><FloatingLabelInput label={messages.fields.cnpj} maxLength={14} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{messages.fields.tipo}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={messages.fields.selectTipo} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Private">{messages.organizations.typePrivada}</SelectItem>
                          <SelectItem value="Public">{messages.organizations.typePublica}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeDialog}>{messages.common.cancel}</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? messages.organizations.createSubmitting : messages.organizations.createSubmit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
