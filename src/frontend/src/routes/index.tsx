import { useMemo } from 'react'
import { useRoutes } from 'react-router-dom'

import { useAuth } from '@/lib/auth/cognito-auth'

import { protectedRoutes } from './protected'
import { publicRoutes } from './public'

const LoadingFallback = () => <div>Loading...</div>

export const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth()

  const routes = useMemo(() => {
    if (isLoading) {
      return [{ path: '*', element: <LoadingFallback /> }]
    }
    return isAuthenticated ? protectedRoutes : publicRoutes
  }, [isAuthenticated, isLoading])

  const element = useRoutes(routes)

  if (isLoading) {
    return <LoadingFallback />
  }

  return <>{element}</>
}
