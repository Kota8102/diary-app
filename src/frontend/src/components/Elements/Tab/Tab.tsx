import {
  add,
  bouquet,
  calendar,
  flower,
  outlinedAdd,
  outlinedBouquet,
  outlinedCalendar,
  outlinedFlower,
  outlinedSetting,
  setting,
} from '@/assets/icons'

import { getToday } from '@/utils/dateUtils'
import { TabItem } from './TabItem'

type TabConfig = {
  path: string
  label: string
  activeIcon: string
  inactiveIcon: string
}

const TAB_ITEMS: TabConfig[] = [
  {
    path: '/app/calendar',
    label: 'カレンダー',
    activeIcon: calendar,
    inactiveIcon: outlinedCalendar,
  },
  {
    path: '/app/bouquet',
    label: '花束をみる',
    activeIcon: bouquet,
    inactiveIcon: outlinedBouquet,
  },
  {
    path: `/app/flower/${getToday()}`,
    label: '花をみる',
    activeIcon: flower,
    inactiveIcon: outlinedFlower,
  },
  {
    path: '/app/diary',
    label: '日記を追加',
    activeIcon: add,
    inactiveIcon: outlinedAdd,
  },
  {
    path: '/app/setting',
    label: '設定',
    activeIcon: setting,
    inactiveIcon: outlinedSetting,
  },
] as const

/**
 * タブナビゲーションコンポーネント
 * アプリケーションの主要な画面遷移を制御するタブバーを表示する
 */
export const Tab = () => {
  return (
    // タブナビゲーションのコンテナ要素
    <nav className="flex justify-between items-center bg-light-bgTab">
      {/* 定義済みのタブ項目をマッピングして表示 */}
      {TAB_ITEMS.map(({ path, label, activeIcon, inactiveIcon }) => (
        <TabItem key={path} linkPath={path} label={label} activeIcon={activeIcon} inactiveIcon={inactiveIcon} />
      ))}
    </nav>
  )
}
