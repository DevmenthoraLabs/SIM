import { UserMinus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { ROLE_LABELS } from '@/lib/constants'
import { messages } from '@/lib/messages'
import { useUnitUsers } from './useUnitUsers'

export default function UnitUsersPage() {
  const {
    unit, users, loading,
    availableUsers, isDialogOpen, setIsDialogOpen, closeDialog,
    selectedUserId, setSelectedUserId,
    removeUser, isRemoving, assignUser, isAssigning,
  } = useUnitUsers()

  return (
    <PageContainer>
      <PageHeader
        title={unit?.name ?? messages.common.loading}
        description={unit ? `${messages.units.headerCodePrefix} ${unit.code}` : undefined}
        actions={unit?.isActive && <Button size="sm" onClick={() => setIsDialogOpen(true)}>{messages.units.addUserButton}</Button>}
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
              title={messages.users.noUsersInUnit}
              action={unit?.isActive ? <Button size="sm" onClick={() => setIsDialogOpen(true)}>{messages.users.assignSubmit}</Button> : undefined}
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.nome}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.email}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.perfil}</th>
                  <th className="text-left px-4 py-3 font-medium">{messages.fields.status}</th>
                  <th className="text-right px-4 py-3 font-medium">{messages.fields.acoes}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{user.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={user.isActive} activeLabel={messages.status.ativo} inactiveLabel={messages.status.inativo} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => removeUser(user.id)}
                        disabled={isRemoving}
                        title={messages.users.removeFromUnitButton}
                        className="text-destructive hover:text-destructive"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{messages.users.assignDialogTitle}</DialogTitle>
            <DialogDescription>{messages.users.assignDialogDescription}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            {availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{messages.users.noUsersAvailable}</p>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={messages.users.selectUser} />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName}
                      <span className="ml-1 text-muted-foreground text-xs">({u.email})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>{messages.common.cancel}</Button>
            <Button onClick={assignUser} disabled={!selectedUserId || isAssigning}>
              {isAssigning ? messages.users.assignSubmitting : messages.users.assignSubmit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
