import { Link } from 'react-router-dom'

import {
  outlinedAdd,
  outlinedBouquet,
  outlinedCalendar,
  outlinedFlower,
  outlinedSetting,
} from '../../../assets/icons'

export const Tab = () => {
  return (
    <div className="flex justify-around items-center h-14 bg-secondaryBackground">
      <Link to="/diarylist">
        <img
          src={outlinedCalendar}
          alt="outlined calendar"
        />
      </Link>
      <Link to="/">
        <img
          src={outlinedBouquet}
          alt="outlined bouquet"
        />
      </Link>
      <Link to="/">
        <img
          src={outlinedFlower}
          alt="outlined flower"
        />
      </Link>
      <Link to="/diary">
        <img
          src={outlinedAdd}
          alt="outlined add"
        />
      </Link>
      <Link to="/setting">
        <img
          src={outlinedSetting}
          alt="outlined setting"
        />
      </Link>
    </div>
  )
}
