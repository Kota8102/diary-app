import { Link } from 'react-router-dom'

import { LuUserCircle } from 'react-icons/lu'
import { MdCalendarMonth, MdAddCircleOutline } from 'react-icons/md'

export const Tab = () => {
  return (
    <div className="flex justify-around items-center h-14 bg-secondaryBackground">
      <Link to="/diarylist">
        <MdCalendarMonth size={26} />
      </Link>
      <Link to="/diary">
        <MdAddCircleOutline size={26} />
      </Link>
      <Link to="/setting">
        <LuUserCircle size={26} />
      </Link>
    </div>
  )
}
