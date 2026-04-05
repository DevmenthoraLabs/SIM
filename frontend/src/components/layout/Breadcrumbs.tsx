import { Link, useLocation } from 'react-router'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { messages } from '@/lib/messages'

interface BreadcrumbOverride {
  path: string
  label: string
}

interface Props {
  overrides?: BreadcrumbOverride[]
}

const ROUTE_LABELS: Record<string, string> = messages.breadcrumbs

/**
 * Routes that have an actual page. Intermediate segments like `/suporte`
 * or `/suporte/users` are display-only (no link).
 */
const NAVIGABLE_ROUTES = new Set([
  '/units',
  '/users',
  '/suporte/organizations',
  '/suporte/users/invite',
])

export default function Breadcrumbs({ overrides }: Props) {
  const { pathname } = useLocation()

  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)

  const crumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const override = overrides?.find((o) => o.path === path)
    const label = override?.label ?? ROUTE_LABELS[segment] ?? segment
    const isLast = index === segments.length - 1
    const isNavigable = !isLast && (NAVIGABLE_ROUTES.has(path) || override != null)

    return { path, label, isLast, isNavigable }
  })

  // Collapse non-navigable intermediate segments (e.g. /suporte/users → skip "users")
  const visible = crumbs.filter((crumb) => crumb.isLast || crumb.isNavigable || !hasNavigableChild(crumb.path, crumbs))

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link
        to="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {visible.map(({ path, label, isLast, isNavigable }) => (
        <span key={path} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          {isLast ? (
            <span className={cn('font-medium text-foreground')}>{label}</span>
          ) : isNavigable ? (
            <Link
              to={path}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ) : (
            <span className="text-muted-foreground">{label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

/** Check if a crumb has a navigable child (meaning this crumb is just a namespace) */
function hasNavigableChild(path: string, crumbs: Array<{ path: string; isNavigable: boolean }>) {
  return crumbs.some((c) => c.path !== path && c.path.startsWith(path + '/'))
}
