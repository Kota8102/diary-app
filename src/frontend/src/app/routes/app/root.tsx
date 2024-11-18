import { Outlet } from 'react-router-dom'

/**
 * アプリケーションのルートコンポーネント
 * 子ルートのコンポーネントを表示するためのOutletを提供します
 */
export const AppRoot = () => {
  return <Outlet />
}

/**
 * アプリケーションのエラーバウンダリーコンポーネント
 * ルート内でエラーが発生した場合にフォールバックとして表示されます
 */
export const AppRootErrorBoundary = () => {
  return <div>Something went wrong!</div>
}
