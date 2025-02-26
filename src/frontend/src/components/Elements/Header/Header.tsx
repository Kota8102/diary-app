import { paths } from '@/config/paths'
import { useNavigate } from 'react-router-dom'

type HeaderProps = {
  title: string
  showHeaderIcon: boolean
}
const HeaderIcon = () => {
  const navigate = useNavigate()

  // ブーケページへ移動
  const handleClick = () => {
    navigate(paths.app.setting.getHref())
  }

  return (
    <button type="button" className="w-8 h-8 rounded-full bg-light-buttonSecondaryDefault" onClick={handleClick} aria-label="ブーケページへ移動" />
  )
}

export const Header = ({ title, showHeaderIcon }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between w-full pt-6 px-6">
      {title && <h1 className="text-2xl text-light-textPlaceholder">{title}</h1>}
      {showHeaderIcon && <HeaderIcon />}
    </div>
  )
}
