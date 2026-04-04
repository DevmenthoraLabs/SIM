import { Link } from 'react-router'
import { Building2, ChevronDown, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function AppHeader() {
  const { user, signOut } = useAuth()

  const isSuperAdmin = user?.role === 'SuperAdmin'
  const isAdmin = user?.role === 'Admin'

  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight text-foreground">
          SIM
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none">
            <span>{user?.email}</span>
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            {isSuperAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/suporte/organizations" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Área de Suporte
                </Link>
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/units" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Unidades
                </Link>
              </DropdownMenuItem>
            )}
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
