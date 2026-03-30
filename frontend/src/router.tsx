import { createBrowserRouter } from 'react-router'
import PrivateRoute from '@/components/layout/PrivateRoute'
import SuperAdminRoute from '@/components/layout/SuperAdminRoute'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/login/LoginPage'
import AuthCallbackPage from '@/pages/auth/callback/AuthCallbackPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import SuporteOrganizationsPage from '@/pages/suporte/organizations/SuporteOrganizationsPage'
import InviteUserPage from '@/pages/suporte/users/InviteUserPage'

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },

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
