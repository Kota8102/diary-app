import { Link, useLocation } from 'react-router-dom'

import {
  calendar,
  bouquet,
  flower,
  add,
  outlinedAdd,
  outlinedBouquet,
  outlinedCalendar,
  outlinedFlower,
  outlinedSetting,
  setting,
} from '../../../assets/icons'

export const Tab = () => {
  const { pathname } = useLocation()

  return (
    <div className="flex justify-around items-center bg-light-bgTab">
      <Link
        to="/diarylist"
        className="flex flex-col items-center pt-2 pb-5">
        {pathname === '/diarylist' ? (
          <img
            src={calendar}
            alt="calendar"
            width="32"
            height="32"
          />
        ) : (
          <img
            src={outlinedCalendar}
            alt="outlined calendar"
            width="32"
            height="32"
          />
        )}
        <span className="text-xs">カレンダー</span>
      </Link>
      <Link
        to="/bouquet"
        className="flex flex-col items-center pt-2 pb-5">
        {pathname === '/bouquet' ? (
          <img
            src={bouquet}
            alt="bouquet"
            width="32"
            height="32"
          />
        ) : (
          <img
            src={outlinedBouquet}
            alt="outlined bouquet"
            width="32"
            height="32"
          />
        )}
        <span className="text-xs">花束をみる</span>
      </Link>
      <Link
        to="/flower"
        className="flex flex-col items-center pt-2 pb-5">
        {pathname === '/flower' ? (
          <img
            src={flower}
            alt="flower"
            width="32"
            height="32"
          />
        ) : (
          <img
            src={outlinedFlower}
            alt="outlined flower"
            width="32"
            height="32"
          />
        )}
        <span className="text-xs">花をみる</span>
      </Link>
      <Link
        to="/diary"
        className="flex flex-col items-center pt-2 pb-5">
        {pathname === '/diary' ? (
          <img
            src={add}
            alt="add"
            width="32"
            height="32"
          />
        ) : (
          <img
            src={outlinedAdd}
            alt="outlined add"
            width="32"
            height="32"
          />
        )}
        <span className="text-xs">日記を追加</span>
      </Link>
      <Link
        to="/setting"
        className="flex flex-col items-center pt-2 pb-5">
        {pathname === '/setting' ? (
          <img
            src={setting}
            alt="setting"
            width="32"
            height="32"
          />
        ) : (
          <img
            src={outlinedSetting}
            alt="outlined setting"
            width="32"
            height="32"
          />
        )}
        <span className="text-xs">設定</span>
      </Link>
    </div>
  )
}
