import { NavLink } from 'react-router'
import {
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/constants'
import { messages } from '@/lib/messages'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItem = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors relative',
    isActive
      ? 'bg-primary/10 text-foreground font-medium before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-primary'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
  )

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-5 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
      {children}
    </p>
  )
}

export default function AppSidebar() {
  const { user, signOut } = useAuth()
  const isAdmin = user?.role === ROLES.Admin
  const isSuperAdmin = user?.role === ROLES.SuperAdmin

  return (
    <aside className="w-60 shrink-0 border-r bg-card flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="h-14 flex items-center px-5 border-b">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">S</span>
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">{messages.nav.sim}</span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <NavLink to="/" end className={navItem}>
          <LayoutDashboard className="h-4 w-4" />
          {messages.nav.dashboard}
        </NavLink>

        {isAdmin && (
          <>
            <SectionLabel>{messages.nav.administracao}</SectionLabel>
            <NavLink to="/units" className={navItem}>
              <Building2 className="h-4 w-4" />
              {messages.nav.unidades}
            </NavLink>
            <NavLink to="/users" className={navItem}>
              <Users className="h-4 w-4" />
              {messages.nav.usuarios}
            </NavLink>
          </>
        )}

        {isSuperAdmin && (
          <>
            <SectionLabel>{messages.nav.suporte}</SectionLabel>
            <NavLink to="/suporte/organizations" className={navItem}>
              <ShieldCheck className="h-4 w-4" />
              {messages.nav.organizacoes}
            </NavLink>
            <NavLink to="/suporte/users/invite" className={navItem}>
              <UserPlus className="h-4 w-4" />
              {messages.nav.convidarUsuario}
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-3 flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none flex-1 min-w-0">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                {user?.email?.charAt(0) ?? '?'}
              </span>
            </div>
            <span className="truncate flex-1 text-left text-xs">{user?.email}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              {messages.nav.sair}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </aside>
  )
}
