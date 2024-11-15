import { Link, useLocation } from 'react-router-dom'

import type { TabConfig } from './types'

/**
 * タブアイテムコンポーネント
 * ナビゲーションタブの各項目を表示する
 */
export const TabItem = ({ path, label: text, activeIcon, inactiveIcon }: TabConfig) => {
  // 現在のパス情報を取得
  const { pathname } = useLocation()

  // 現在のパスとリンク先パスから、ベースパスを抽出
  // 例: /app/flower/2023-12-25 -> /app/flower
  const basePath = `/${pathname.split('/').slice(1, 3).join('/')}`
  const linkBasePath = `/${path.split('/').slice(1, 3).join('/')}`

  // 現在のタブがアクティブかどうかを判定
  const isActive = basePath === linkBasePath

  return (
    // タブアイテムのリンク要素
    <Link to={path} className="flex flex-col items-center py-2 gap-1 w-1/5">
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
