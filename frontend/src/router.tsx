/* eslint-disable react-refresh/only-export-components -- router.tsx is a config file, not a component module */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import PrivateRoute from '@/components/layout/PrivateRoute'
import SuperAdminRoute from '@/components/layout/SuperAdminRoute'
import AdminRoute from '@/components/layout/AdminRoute'
import AppLayout from '@/components/layout/AppLayout'

const LoginPage = lazy(() => import('@/pages/login/LoginPage'))
const AuthCallbackPage = lazy(() => import('@/pages/auth/callback/AuthCallbackPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const SuporteOrganizationsPage = lazy(
  () => import('@/pages/suporte/organizations/SuporteOrganizationsPage')
)
const InviteUserPage = lazy(() => import('@/pages/suporte/users/InviteUserPage'))
const UnitsPage = lazy(() => import('@/pages/units/UnitsPage'))
const UnitUsersPage = lazy(() => import('@/pages/units/UnitUsersPage'))
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

          // SuperAdmin area
          {
            element: <SuperAdminRoute />,
            children: [
              { path: '/suporte/organizations', element: <SuporteOrganizationsPage /> },
              { path: '/suporte/users/invite', element: <InviteUserPage /> },
            ],
          },

          // Admin area
          {
            element: <AdminRoute />,
            children: [
              { path: '/units', element: <UnitsPage /> },
              { path: '/units/:unitId/users', element: <UnitUsersPage /> },
            ],
          },
        ],
      },
    ],
  },
])
