import { useNavigate } from 'react-router-dom'

import { ContentLayout } from '../../../components/layout'
import { useAuth } from '../../auth/utils/cognito-auth'

export const Setting = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error)
    }
  }

  return (
    <ContentLayout pagetitle="各種設定">
      <div className="flex flex-col w-full divide-y divide-gray-400">
        <a
          href="#"
          className="block p-4 w-full">
          ダークモード
        </a>
        <a
          href="#"
          className="block p-4 w-full">
          パスワードの変更
        </a>
        <a
          href="#"
          className="block p-4 w-full">
          通知設定
        </a>
        <button
          onClick={handleLogout}
          className="block p-4 w-full text-left">
          ログアウト
        </button>
        <div className="border-t border-gray-400" />
      </div>
    </ContentLayout>
  )
}
