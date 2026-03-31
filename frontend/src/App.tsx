import { Suspense } from 'react'
import { RouterProvider } from 'react-router'
import { router } from '@/router'

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
