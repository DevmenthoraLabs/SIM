import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PageContainer from '@/components/layout/PageContainer'
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Usuários</h1>
        <Button onClick={() => setIsDialogOpen(true)}>{messages.users.inviteSubmit}</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{messages.common.loading}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{messages.common.noData}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Nome</th>
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-left py-2 font-medium">Perfil</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{user.fullName}</td>
                    <td className="py-2 text-muted-foreground">{user.email}</td>
                    <td className="py-2">
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
                    <td className="py-2">
                      <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-destructive'}`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
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
            <DialogTitle>Convidar usuário</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="usuario@farmacia.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl><Input placeholder="João da Silva" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione um perfil..." /></SelectTrigger>
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
                    <FormLabel>Unidades</FormLabel>
                    {units.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{messages.users.noUnitsForOrg}</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {units.map((unit) => (
                          <label key={unit.id} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={selectedUnitIds.includes(unit.id)}
                              onChange={() => toggleUnit(unit.id)}
                              className="accent-primary"
                            />
                            <span>{unit.name}</span>
                            <span className="text-muted-foreground text-xs">({unit.code})</span>
                          </label>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>{messages.common.cancel}</Button>
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
