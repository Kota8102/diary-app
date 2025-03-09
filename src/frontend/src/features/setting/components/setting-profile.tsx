import { api } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export const SettingProfile = () => {
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // プロフィール画像を取得するAPIリクエスト
  const fetchProfileImage = async () => {
    const response = await api.get('/settings')

    if (!response.data) return null

    const isBase64Encoded = response.headers['content-encoding'] === 'base64'

    if (isBase64Encoded) {
      return `data:${response.headers['content-type']};base64,${response.data}`
    }
    return null
  }

  // React Query を使用したプロフィール画像の取得
  const { data: profileImage, isLoading } = useQuery({
    queryKey: ['profile-image'],
    queryFn: fetchProfileImage,
  })

  // プロフィール画像をアップロードするAPIリクエスト
  const uploadProfileImage = async (base64String: string) => {
    await api.post('/settings', { body: base64String }, { headers: { 'Content-Type': 'application/json' } })
  }

  // React Query の useMutation を使用
  const uploadMutation = useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-image'] }) // 画像キャッシュを更新
    },
    onError: (error) => {
      console.error('画像のアップロードに失敗しました:', error)
    },
  })

  // 画像アップロード処理
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result?.toString().split(',')[1]
      if (base64String) {
        uploadMutation.mutate(base64String)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {/* 背景 */}
      <div className="bg-light-bgSetting h-36" />

      {/* プロフィール画像 */}
      <div className="absolute left-1/2 top-0 transform -translate-x-1/2 translate-y-1/2">
        <div className="w-[120px] h-[120px] rounded-full border-8 border-white overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading...</div>
          ) : profileImage ? (
            <img src={profileImage} alt="プロフィール画像" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
          )}
        </div>
      </div>

      {/* 画像アップロードボタン */}
      <div className="text-center mt-20">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="upload-image" />
        <label htmlFor="upload-image" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded">
          プロフィール画像を変更
        </label>
      </div>
    </div>
  )
}
