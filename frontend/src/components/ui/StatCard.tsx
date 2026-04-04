import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

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
      <Card className="transition-colors group-hover:bg-muted/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stat}</p>
          <CardDescription className="mt-1">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}
