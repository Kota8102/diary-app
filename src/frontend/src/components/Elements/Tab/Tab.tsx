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
} from '../../../assets/icons'

import { TabItem } from './TabItem'

export const Tab = () => {
  return (
    <div className="flex justify-between items-center bg-light-bgTab">
      <TabItem linkPath="/calendar" label="カレンダー" activeIcon={calendar} inactiveIcon={outlinedCalendar} />
      <TabItem linkPath="/bouquet" label="花束をみる" activeIcon={bouquet} inactiveIcon={outlinedBouquet} />
      <TabItem linkPath="/flower" label="花をみる" activeIcon={flower} inactiveIcon={outlinedFlower} />
      <TabItem linkPath="/diary" label="日記を追加" activeIcon={add} inactiveIcon={outlinedAdd} />
      <TabItem linkPath="/setting" label="設定" activeIcon={setting} inactiveIcon={outlinedSetting} />
    </div>
  )
}
