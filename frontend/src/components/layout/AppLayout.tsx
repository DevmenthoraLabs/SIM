import { Outlet } from 'react-router'
import AppHeader from './AppHeader'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
