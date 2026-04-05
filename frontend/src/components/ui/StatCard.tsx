import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  icon: LucideIcon
  title: string
  stat: string | number
  description: string
  href: string
}

export function StatCard({ icon: Icon, title, stat, description, href }: StatCardProps) {
  return (
    <Link to={href} className="block group">
      <Card className="transition-all group-hover:shadow-md group-hover:border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{stat}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
