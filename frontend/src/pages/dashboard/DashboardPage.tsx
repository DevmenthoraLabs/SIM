import { Building2, ShieldCheck, UserPlus } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { useDashboard } from './useDashboard'

export default function DashboardPage() {
  const { user, isAdmin, isSuperAdmin, activeUnits, totalOrganizations } = useDashboard()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Olá, {user?.email}</h1>
        <p className="text-sm text-muted-foreground mt-1">Bem-vindo ao SIM.</p>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Building2}
            title="Unidades"
            stat={activeUnits}
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
    </div>
  )
}
