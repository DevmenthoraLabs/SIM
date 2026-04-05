import { Outlet } from 'react-router'
import AppSidebar from './AppSidebar'
import Breadcrumbs from './Breadcrumbs'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-11 shrink-0 border-b bg-background flex items-center px-6">
          <Breadcrumbs />
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
