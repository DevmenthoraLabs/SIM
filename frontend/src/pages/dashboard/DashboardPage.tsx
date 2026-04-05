import { Building2, ShieldCheck, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/StatCard'
import PageContainer from '@/components/layout/PageContainer'
import { messages } from '@/lib/messages'
import { useDashboard } from './useDashboard'

export default function DashboardPage() {
  const { user, isAdmin, isSuperAdmin, isOperational, activeUnits, totalOrganizations } = useDashboard()

  return (
    <PageContainer wide>
      <div>
        <h1 className="text-xl font-semibold">Olá, {user?.email}</h1>
        <p className="text-sm text-muted-foreground mt-1">Bem-vindo ao SIM.</p>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Building2}
            title="Unidades"
            stat={activeUnits.length}
            description="Unidades ativas na organização"
            href="/units"
          />
        </div>
      )}

      {isSuperAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={ShieldCheck}
            title="Organizações"
            stat={totalOrganizations}
            description="Organizações cadastradas no sistema"
            href="/suporte/organizations"
          />
          <StatCard
            icon={UserPlus}
            title="Convidar usuário"
            stat="→"
            description="Enviar convite para novo usuário"
            href="/suporte/users/invite"
          />
        </div>
      )}

      {isOperational && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unidades da organização</CardTitle>
          </CardHeader>
          <CardContent>
            {activeUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground">{messages.common.noData}</p>
            ) : (
              <div className="divide-y">
                {activeUnits.map((unit) => (
                  <div key={unit.id} className="flex items-center gap-3 py-2">
                    <span className="text-sm font-medium">{unit.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{unit.code}</span>
                    {unit.address && (
                      <span className="text-xs text-muted-foreground hidden sm:block">{unit.address}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
