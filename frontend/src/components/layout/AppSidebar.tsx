import { NavLink } from 'react-router'
import { Building2, ChevronDown, LayoutDashboard, LogOut, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/constants'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItem = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-muted text-foreground font-medium'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
  )

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  )
}

export default function AppSidebar() {
  const { user, signOut } = useAuth()
  const isAdmin = user?.role === ROLES.Admin
  const isSuperAdmin = user?.role === ROLES.SuperAdmin

  return (
    <aside className="w-56 shrink-0 border-r bg-background flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="h-14 flex items-center px-5 border-b">
        <NavLink to="/" className="text-lg font-bold tracking-tight text-foreground">
          SIM
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <NavLink to="/" end className={navItem}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        {isAdmin && (
          <>
            <SectionLabel>Administração</SectionLabel>
            <NavLink to="/units" className={navItem}>
              <Building2 className="h-4 w-4" />
              Unidades
            </NavLink>
            <NavLink to="/users" className={navItem}>
              <Users className="h-4 w-4" />
              Usuários
            </NavLink>
          </>
        )}

        {isSuperAdmin && (
          <>
            <SectionLabel>Suporte</SectionLabel>
            <NavLink to="/suporte/organizations" className={navItem}>
              <ShieldCheck className="h-4 w-4" />
              Organizações
            </NavLink>
            <NavLink to="/suporte/users/invite" className={navItem}>
              <UserPlus className="h-4 w-4" />
              Convidar usuário
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-2 flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none flex-1 min-w-0">
            <span className="truncate flex-1 text-left">{user?.email}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </aside>
  )
}
