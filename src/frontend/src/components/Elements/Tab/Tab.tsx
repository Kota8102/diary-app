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
    <div className="flex justify-around items-center h-14 bg-light-bgTab">
      <Link to="/diarylist">
        {pathname === '/diarylist' ? (
          <img
            src={calendar}
            alt="calendar"
            width="40"
            height="40"
          />
        ) : (
          <img
            src={outlinedCalendar}
            alt="outlined calendar"
            width="40"
            height="40"
          />
        )}
      </Link>
      <Link to="/bouquet">
        {pathname === '/bouquet' ? (
          <img
            src={bouquet}
            alt="bouquet"
            width="40"
            height="40"
          />
        ) : (
          <img
            src={outlinedBouquet}
            alt="outlined bouquet"
            width="40"
            height="40"
          />
        )}
      </Link>
      <Link to="/flower">
        {pathname === '/flower' ? (
          <img
            src={flower}
            alt="flower"
            width="40"
            height="40"
          />
        ) : (
          <img
            src={outlinedFlower}
            alt="outlined flower"
            width="40"
            height="40"
          />
        )}
      </Link>
      <Link to="/diary">
        {pathname === '/diary' ? (
          <img
            src={add}
            alt="add"
            width="40"
            height="40"
          />
        ) : (
          <img
            src={outlinedAdd}
            alt="outlined add"
            width="40"
            height="40"
          />
        )}
      </Link>
      <Link to="/setting">
        {pathname === '/setting' ? (
          <img
            src={setting}
            alt="setting"
            width="40"
            height="40"
          />
        ) : (
          <img
            src={outlinedSetting}
            alt="outlined setting"
            width="40"
            height="40"
          />
        )}
      </Link>
    </div>
  )
}
