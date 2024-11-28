import profileImage from '@/assets/profileImage.png'

export const SettingProfile = () => {
  return (
    <div>
      {/* 背景 */}
      <div className="bg-light-bgSetting h-36" />
      {/* プロフィール画像 */}
      <div className="absolute left-1/2 top-0 transform -translate-x-1/2 translate-y-1/2">
        <div className="w-[120px] h-[120px] rounded-full border-8 border-white overflow-hidden">
          <img src={profileImage} alt="プロフィール画像" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  )
}
