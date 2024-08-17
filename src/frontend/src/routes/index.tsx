import { useRoutes } from 'react-router-dom'

import { useAuth } from '../lib/cognito-auth'

import { protectedRoutes } from './protected'
import { publicRoutes } from './public'

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth()
  const routes = isAuthenticated ? protectedRoutes : publicRoutes
  const element = useRoutes(routes)

  return <>{element}</>
}
