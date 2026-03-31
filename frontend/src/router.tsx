/* eslint-disable react-refresh/only-export-components -- router.tsx is a config file, not a component module */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import PrivateRoute from '@/components/layout/PrivateRoute'
import SuperAdminRoute from '@/components/layout/SuperAdminRoute'
import AppLayout from '@/components/layout/AppLayout'

const LoginPage = lazy(() => import('@/pages/login/LoginPage'))
const AuthCallbackPage = lazy(() => import('@/pages/auth/callback/AuthCallbackPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const SuporteOrganizationsPage = lazy(
  () => import('@/pages/suporte/organizations/SuporteOrganizationsPage')
)
const InviteUserPage = lazy(() => import('@/pages/suporte/users/InviteUserPage'))
const NotFoundPage = lazy(() => import('@/pages/not-found/NotFoundPage'))

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '*', element: <NotFoundPage /> },

  // Authenticated routes
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          {
            element: <SuperAdminRoute />,
            children: [
              { path: '/suporte/organizations', element: <SuporteOrganizationsPage /> },
              { path: '/suporte/users/invite', element: <InviteUserPage /> },
            ],
          },
        ],
      },
    ],
  },
])
