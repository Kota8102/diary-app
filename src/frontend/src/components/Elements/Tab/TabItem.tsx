import { Link, useLocation } from 'react-router-dom'

type TabItemProps = {
  linkPath: string
  label: string
  activeIcon: string
  inactiveIcon: string
}

export const TabItem = ({ linkPath, label: text, activeIcon, inactiveIcon }: TabItemProps) => {
  const { pathname } = useLocation()

  return (
    <Link to={linkPath} className="flex flex-col items-center py-2 gap-1 w-1/5">
      {pathname === linkPath ? (
        <img src={activeIcon} alt="Active Icon" width="32" height="32" />
      ) : (
        <img src={inactiveIcon} alt="Inactive Icon" width="32" height="32" />
      )}
      <span className="text-[10px]">{text}</span>
    </Link>
  )
}
