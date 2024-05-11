import { Link } from 'react-router-dom'

import { calendar, add, setting, bouquet, flower } from '../../../assets/icons'

export const Tab = () => {
  return (
    <div className="flex justify-around items-center h-14 bg-secondaryBackground">
      <Link to="/diarylist">
        <img
          src={calendar}
          alt="calendar"
        />
      </Link>
      <Link to="/">
        <img
          src={bouquet}
          alt="bouquet"
        />
      </Link>
      <Link to="/">
        <img
          src={flower}
          alt="flower"
        />
      </Link>
      <Link to="/diary">
        <img
          src={add}
          alt="add"
        />
      </Link>
      <Link to="/setting">
        <img
          src={setting}
          alt="setting"
        />
      </Link>
    </div>
  )
}
