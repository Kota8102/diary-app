import { logoFlower, logoName } from '@/assets/icons'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export const AuthChoice = () => {
  // ページ遷移のためのフック
  const navigate = useNavigate()

  // 新規登録ボタンのクリックハンドラー
  const handleSignupClick = () => {
    navigate('/auth/terms') // 利用規約ページへ遷移
  }

  // ログインボタンのクリックハンドラー
  const handleLoginClick = () => {
    navigate('/auth/login') // ログインページへ遷移
  }

  return (
    // 画面全体を縦方向に分割し、要素間の空間を均等に配置
    <div className="flex flex-col justify-between h-full">
      {/* ロゴ表示エリア: 中央寄せで縦方向にロゴを配置 */}
      <div className="flex-1 flex flex-col gap-y-3 items-center justify-center">
        {/* !todo: ロゴのサイズを確認 */}
        <img src={logoFlower} alt="logoFlower" className="w-20 h-20" />
        <img src={logoName} alt="logoName" className="w-40 h-8" />
      </div>
      {/* ボタンエリア: 縦方向に新規登録とログインボタンを配置 */}
      <div className="flex flex-col gap-3">
        <Button onClick={handleSignupClick}>新規登録</Button>
        <Button onClick={handleLoginClick}>ログイン</Button>
      </div>
    </div>
  )
}
