import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { paths } from '@/config/paths'
import { useAuth } from '@/lib/auth/cognito-auth'
import { LoadingRoute } from './loading'

export const RootRoute = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate(paths.app.getHref(), { replace: true })
      } else {
        navigate(paths.auth.choice.getHref(), { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, navigate])

  return <LoadingRoute />
}
