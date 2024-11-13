import { Navigate, useLocation } from 'react-router-dom'

import { paths } from '@/config/paths'
import { useAuth } from './cognito-auth'

/**
 * 認証が必要なルートを保護するコンポーネント
 * 未認証の場合はログインページにリダイレクトする
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // 認証状態を取得
  const { isAuthenticated } = useAuth()
  // 現在のURLパスを取得
  const location = useLocation()

  // 未認証の場合
  if (!isAuthenticated) {
    // デバッグ用：リダイレクト情報をコンソールに出力
    console.log({
      pathname: location.pathname,
      redirectTo: paths.auth.login.getHref(location.pathname),
    })
    // ログインページへリダイレクト（現在のパスをリダイレクト先として保持）
    return <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
  }

  // 認証済みの場合は子コンポーネントを表示
  return children
}
