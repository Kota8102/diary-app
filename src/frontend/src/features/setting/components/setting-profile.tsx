import { api } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ChangeEvent, useState } from 'react'
import { FiCamera } from 'react-icons/fi'

export const SettingProfile = () => {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // プロフィール画像を取得するAPIリクエスト
  const fetchProfileImage = async () => {
    const response = await api.get('/settings')
    if (!response.data) return null
    return `data:image/jpeg;base64,${response.data}`
  }

  // React Query を使用したプロフィール画像の取得
  const { data: profileImage, isLoading } = useQuery({
    queryKey: ['profile-image'],
    queryFn: fetchProfileImage,
  })

  // プロフィール画像をアップロードするAPIリクエスト
  const uploadProfileImage = async (base64String: string) => {
    await api.post('/settings', base64String, { headers: { 'Content-Type': 'application/json' } })
  }

  // React Query の useMutation を使用
  const uploadMutation = useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-image'] }) // 画像キャッシュを更新
      setErrorMessage(null) // エラーメッセージをクリア
    },
    onError: (error) => {
      console.error('画像のアップロードに失敗しました:', error)
      setErrorMessage('画像のアップロードに失敗しました。再度お試しください。')
    },
  })

  // 画像アップロード処理
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 画像のバリデーション
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validImageTypes.includes(file.type)) {
      setErrorMessage('サポートされていない画像形式です。JPEGまたはPNG形式の画像をアップロードしてください。')
      return
    }

    const maxSizeInBytes = 1 * 1024 * 1024 // 5MB
    if (file.size > maxSizeInBytes) {
      setErrorMessage('画像サイズが大きすぎます。1MB以下の画像をアップロードしてください。')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result?.toString()
      if (base64String) {
        uploadMutation.mutate(base64String)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="relative">
      {/* エラーメッセージ */}
      {errorMessage && <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-center py-2">{errorMessage}</div>}

      {/* 背景 */}
      <div className="bg-light-bgSetting h-36" />

      {/* プロフィール画像 */}
      <div className="absolute left-1/2 top-0 transform -translate-x-1/2 translate-y-1/2">
        <label htmlFor="upload-image" className="cursor-pointer">
          <div className="w-[120px] h-[120px] rounded-full border-8 border-white overflow-hidden relative group">
            {isLoading ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading...</div>
            ) : profileImage ? (
              <img src={profileImage} alt="プロフィール画像" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
            )}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 flex items-center justify-center transition-opacity">
              <FiCamera className="text-white text-3xl" />
            </div>
          </div>
        </label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="upload-image" />
      </div>
    </div>
  )
}
