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
    <Link
      to={linkPath}
      className="flex flex-col items-center pt-2 pb-5">
      {pathname === linkPath ? (
        <img
          src={activeIcon}
          width="32"
          height="32"
        />
      ) : (
        <img
          src={inactiveIcon}
          width="32"
          height="32"
        />
      )}
      <span className="text-xs">{text}</span>
    </Link>
  )
}
