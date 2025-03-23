import { paths } from '@/config/paths'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

type HeaderProps = {
  title: string
  showHeaderIcon: boolean
}

const HeaderIcon = () => {
  const navigate = useNavigate()

  // プロフィール画像を取得する関数
  const fetchProfileImage = async () => {
    const response = await api.get('/settings')
    if (!response.data) return null
    return `data:image/jpeg;base64,${response.data}`
  }

  // React Query を使用してプロフィール画像を取得
  const { data: profileImage, isLoading, error } = useQuery({
    queryKey: ['profile-image'],
    queryFn: fetchProfileImage,
  })
  if (error) {
    console.error('Error fetching profile image:', error)
    return <div className="w-full h-full bg-red-200 flex items-center justify-center">Error loading image</div>
  }
  })

  // プロフィール画像クリック時の処理
  const handleClick = () => {
    navigate(paths.app.setting.getHref())
  }

  return (
    <button type="button" className="w-8 h-8 rounded-full bg-light-buttonSecondaryDefault overflow-hidden" onClick={handleClick}>
      {isLoading ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading...</div>
      ) : profileImage ? (
        <img src={profileImage} alt="プロフィール画像" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
      )}
    </button>
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
