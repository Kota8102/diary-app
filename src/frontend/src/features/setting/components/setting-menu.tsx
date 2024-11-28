import { paths } from '@/config/paths'
import { useAuth } from '@/lib/auth/cognito-auth'
import { useNavigate } from 'react-router-dom'

export const SettingMenu = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  // ログアウト
  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました:', error)
    }
  }

  // パスワード変更
  const handleChangePassword = () => {
    navigate(paths.app.changePassword.getHref())
  }

  return (
    <div className="pt-20 px-4">
      <h1 className="text-xl font-bold px-3">各種設定</h1>

      <div className="flex flex-col w-full pt-2">
        <button className="px-3 py-6 text-left border-b border-gray-200" type="button">
          ダークモード(未実装)
        </button>
        <button onClick={handleChangePassword} className="px-3 py-6 text-left border-b border-gray-200" type="button">
          パスワードの変更
        </button>
        <button onClick={handleLogout} className="py-6 px-3 text-left border-gray-200 w-full" type="button">
          ログアウト
        </button>
      </div>
    </div>
  )
}
