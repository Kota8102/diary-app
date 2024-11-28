import { Tab } from '@/components/ui/Tab'
import { SettingMenu } from '@/features/setting/components/setting-menu'
import { SettingProfile } from '@/features/setting/components/setting-profile'

export const SettingRoute = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* プロフィール */}
      <SettingProfile />
      {/* メニュー */}
      <SettingMenu />
      {/* タブナビゲーション */}
      <div className="mt-auto">
        <Tab />
      </div>
    </div>
  )
}
