import { Users } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { UnitCheckList } from '@/components/ui/UnitCheckList'
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
import { ROLES, ROLE_LABELS } from '@/lib/constants'
import { messages } from '@/lib/messages'
import { useUsers } from './useUsers'

export default function UsersPage() {
  const {
    users, units, loading, serverError,
    isDialogOpen, setIsDialogOpen, closeDialog,
    form, onSubmit, isSubmitting,
    isOperationalRole, toggleUnit,
    updateRole, isUpdatingRole,
  } = useUsers()

  const selectedUnitIds: string[] = form.watch('unitIds') ?? []

  return (
    <PageContainer>
      <PageHeader
        title={messages.pages.usersTitle}
        description={messages.pages.usersDescription}
        actions={<Button onClick={() => setIsDialogOpen(true)}>{messages.users.inviteSubmit}</Button>}
      />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <Spinner />
              <span className="text-sm text-muted-foreground">{messages.common.loading}</span>
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title={messages.common.noData}
              description={messages.common.noDataHint}
              action={<Button onClick={() => setIsDialogOpen(true)}>{messages.users.inviteSubmit}</Button>}
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.nome}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.email}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.perfil}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.status}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{user.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <Select value={user.role} onValueChange={(role) => updateRole(user.id, role)} disabled={isUpdatingRole}>
                        <SelectTrigger className="h-7 w-44 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(ROLES) as Array<keyof typeof ROLES>)
                            .filter((key) => ROLES[key] !== ROLES.SuperAdmin)
                            .map((key) => (
                              <SelectItem key={key} value={ROLES[key]}>{ROLE_LABELS[ROLES[key]]}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={user.isActive} activeLabel={messages.status.ativo} inactiveLabel={messages.status.inativo} />
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
            <DialogTitle>{messages.users.inviteDialogTitle}</DialogTitle>
            <DialogDescription>{messages.users.inviteDialogDescription}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <DialogBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{messages.fields.email}</FormLabel>
                      <FormControl><Input type="email" placeholder={messages.fields.placeholderEmailUsuario} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{messages.fields.nome}</FormLabel>
                      <FormControl><Input placeholder={messages.fields.placeholderNome} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{messages.fields.perfil}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={messages.fields.selectPerfil} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(ROLES) as Array<keyof typeof ROLES>)
                          .filter((key) => ROLES[key] !== ROLES.SuperAdmin)
                          .map((key) => (
                            <SelectItem key={key} value={ROLES[key]}>{ROLE_LABELS[ROLES[key]]}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                {isOperationalRole && (
                  <FormField control={form.control} name="unitIds" render={() => (
                    <FormItem>
                      <FormLabel>{messages.fields.unidades}</FormLabel>
                      {units.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{messages.users.noUnitsForOrg}</p>
                      ) : (
                        <UnitCheckList
                          units={units}
                          selected={selectedUnitIds}
                          onToggle={toggleUnit}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeDialog}>{messages.common.cancel}</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? messages.users.inviteSubmitting : messages.users.inviteSubmit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
