import { Navigate } from 'react-router-dom'

import { Landing } from '@/components/Elements/Landing'
import { lazyImport } from '@/utils/lazyImport'

const { AuthRoutes } = lazyImport(() => import('@/features/auth'), 'AuthRoutes')

export const publicRoutes = [
  {
    path: '/',
    element: <Navigate to="/auth" replace />,
  },
  {
    path: '/landing',
    element: <Landing />,
  },
  {
    path: '/auth/*',
    element: <AuthRoutes />,
  },
  {
    path: '*',
    element: <Navigate to="/auth" replace />,
  },
]
