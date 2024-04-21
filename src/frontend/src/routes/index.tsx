import { useRoutes } from 'react-router-dom'

import { publicRoutes } from './public'

export const AppRoutes = () => {
  // 未ログインの画面を表示するためpublicRoutesを使用
  const element = useRoutes(publicRoutes)

  return <> {element} </>
}
