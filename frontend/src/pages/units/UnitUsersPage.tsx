import { UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUnitUsers } from './useUnitUsers'

const ROLE_LABELS: Record<string, string> = {
  SuperAdmin: 'Super Admin',
  Admin: 'Admin',
  Pharmacist: 'Farmacêutico',
  StockManager: 'Gestor de Estoque',
  ReceivingOperator: 'Operador de Recebimento',
}

export default function UnitUsersPage() {
  const { unit, users, loading, removeUser, isRemoving, goBack } = useUnitUsers()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={goBack}>← Voltar</Button>
        <div>
          <h1 className="text-xl font-semibold">{unit?.name ?? 'Unidade'}</h1>
          {unit && (
            <p className="text-sm text-muted-foreground">Código: {unit.code}</p>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Carregando...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum usuário atribuído a esta unidade.
            </p>
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
                        variant="ghost"
                        size="sm"
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
    </div>
  )
}
