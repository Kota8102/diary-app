import { useRoutes } from 'react-router-dom'

import { Landing } from '../components/Elements/Landing'
// import { useAuth } from '../features/auth/utils/cognito-auth'

import { protectedRoutes } from './protected'
// import { publicRoutes } from './public'

export const AppRoutes = () => {
  // const { isAuthenticated } = useAuth()
  const commonRoutes = [{ path: '/', element: <Landing /> }]
  // const routes = isAuthenticated ? protectedRoutes : publicRoutes
  // const element = useRoutes([...routes, ...commonRoutes])
  const element = useRoutes([...protectedRoutes, ...commonRoutes])

  return <>{element}</>
}
