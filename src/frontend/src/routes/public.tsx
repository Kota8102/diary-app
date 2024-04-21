import { Navigate } from 'react-router-dom'

import { lazyImport } from '../utils/lazyImport'

const { AuthRoutes } = lazyImport(() => import('../features/auth'), 'AuthRoutes')

export const publicRoutes = [
  {
    path: '/auth/*',
    element: <AuthRoutes />,
  },
  {
    path: '/*',
    element: <Navigate to="/auth" />,
  },
]
