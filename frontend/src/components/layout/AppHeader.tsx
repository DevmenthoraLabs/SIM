import { Link, NavLink } from 'react-router'
import { ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-sm transition-colors ${
    isActive
      ? 'bg-muted text-foreground font-medium'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  }`

export default function AppHeader() {
  const { user, signOut } = useAuth()

  const isSuperAdmin = user?.role === ROLES.SuperAdmin
  const isAdmin = user?.role === ROLES.Admin

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-6">
        <Link to="/" className="text-lg font-bold tracking-tight text-foreground shrink-0">
          SIM
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {isAdmin && (
            <>
              <NavLink to="/units" className={navLinkClass}>Unidades</NavLink>
              <NavLink to="/users" className={navLinkClass}>Usuários</NavLink>
            </>
          )}
          {isSuperAdmin && (
            <>
              <NavLink to="/suporte/organizations" className={navLinkClass}>Organizações</NavLink>
              <NavLink to="/suporte/users/invite" className={navLinkClass}>Convidar usuário</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none">
              <span className="max-w-48 truncate">{user?.email}</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
