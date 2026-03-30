import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { ChevronDown, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function AppHeader() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const isSuperAdmin = user?.role === 'SuperAdmin'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight text-foreground">
          SIM
        </Link>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span>{user?.email}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-52 rounded-md border bg-popover shadow-md z-50">
              <div className="py-1">
                {isSuperAdmin && (
                  <Link
                    to="/suporte/organizations"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    Área de Suporte
                  </Link>
                )}
                <button
                  onClick={() => { setOpen(false); signOut() }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
