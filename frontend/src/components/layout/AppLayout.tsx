import { Outlet } from 'react-router'
import AppSidebar from './AppSidebar'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
