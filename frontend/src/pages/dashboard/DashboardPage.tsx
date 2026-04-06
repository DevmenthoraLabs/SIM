import { Building2, ShieldCheck, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/StatCard'
import PageContainer from '@/components/layout/PageContainer'
import PageHeader from '@/components/layout/PageHeader'
import { messages } from '@/lib/messages'
import { useDashboard } from './useDashboard'

export default function DashboardPage() {
  const { user, isAdmin, isSuperAdmin, isOperational, activeUnits, totalOrganizations } = useDashboard()

  return (
    <PageContainer wide>
      <PageHeader
        title={messages.pages.dashboardGreeting.replace('{email}', user?.email ?? '')}
        description={messages.pages.dashboardDescription}
      />

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Building2}
            title={messages.pages.dashboardStatUnitsTitle}
            stat={activeUnits.length}
            description={messages.pages.dashboardStatUnitsDesc}
            href="/units"
          />
        </div>
      )}

      {isSuperAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={ShieldCheck}
            title={messages.pages.dashboardStatOrgsTitle}
            stat={totalOrganizations}
            description={messages.pages.dashboardStatOrgsDesc}
            href="/suporte/organizations"
          />
          <StatCard
            icon={UserPlus}
            title={messages.pages.dashboardStatInviteTitle}
            stat="→"
            description={messages.pages.dashboardStatInviteDesc}
            href="/suporte/users/invite"
          />
        </div>
      )}

      {isOperational && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{messages.pages.dashboardCardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground">{messages.common.noData}</p>
            ) : (
              <div className="divide-y">
                {activeUnits.map((unit) => (
                  <div key={unit.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{unit.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {unit.code}
                        {unit.address && ` · ${unit.address}`}
                      </p>
                    </div>
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
