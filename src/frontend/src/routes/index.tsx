import { useRoutes } from 'react-router-dom'
import { protectedRoutes } from './protected'
// import { publicRoutes } from './public'

export const AppRoutes = () => {
  // 未ログインの画面を表示するためpublicRoutesを使用
  const element = useRoutes(protectedRoutes)

  return <> {element} </>
}
