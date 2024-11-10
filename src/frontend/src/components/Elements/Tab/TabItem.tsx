import { Link, useLocation } from 'react-router-dom'

type TabItemProps = {
  linkPath: string // タブのリンク先パス
  label: string // タブのラベルテキスト
  activeIcon: string // アクティブ時のアイコン画像パス
  inactiveIcon: string // 非アクティブ時のアイコン画像パス
}

/**
 * タブアイテムコンポーネント
 * ナビゲーションタブの各項目を表示する
 */
export const TabItem = ({ linkPath, label: text, activeIcon, inactiveIcon }: TabItemProps) => {
  // 現在のパス情報を取得
  const { pathname } = useLocation()

  // 現在のパスとリンク先パスから、ベースパスを抽出
  // 例: /flower/2023-12-25 -> /flower
  const basePath = `/${pathname.split('/')[1]}`
  const linkBasePath = `/${linkPath.split('/')[1]}`

  // 現在のタブがアクティブかどうかを判定
  const isActive = basePath === linkBasePath

  return (
    // タブアイテムのリンク要素
    <Link to={linkPath} className="flex flex-col items-center py-2 gap-1 w-1/5">
      {/* アクティブ状態に応じてアイコンを切り替え */}
      {isActive ? (
        <img src={activeIcon} alt="Active Icon" width="32" height="32" />
      ) : (
        <img src={inactiveIcon} alt="Inactive Icon" width="32" height="32" />
      )}
      {/* タブのラベルテキスト */}
      <span className="text-[10px]">{text}</span>
    </Link>
  )
}
