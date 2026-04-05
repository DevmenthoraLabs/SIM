import { Link } from 'react-router'
import { UserMinus } from 'lucide-react'
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
      <div className="flex items-start justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-0.5">
            <Link to="/units" className="hover:text-foreground transition-colors">Unidades</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{unit?.name ?? '...'}</span>
          </nav>
          {unit && <p className="text-sm text-muted-foreground">Código: {unit.code}</p>}
        </div>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>Adicionar usuário</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{messages.common.loading}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{messages.users.noUsersInUnit}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Nome</th>
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-left py-2 font-medium">Perfil</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{user.fullName}</td>
                    <td className="py-2 text-muted-foreground">{user.email}</td>
                    <td className="py-2">{ROLE_LABELS[user.role] ?? user.role}</td>
                    <td className="py-2">
                      <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-destructive'}`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => removeUser(user.id)}
                        disabled={isRemoving}
                        title="Remover da unidade"
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
            <DialogTitle>Adicionar usuário à unidade</DialogTitle>
          </DialogHeader>
          {availableUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">{messages.users.noUsersAvailable}</p>
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
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>{messages.common.cancel}</Button>
            <Button onClick={assignUser} disabled={!selectedUserId || isAssigning}>
              {isAssigning ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
