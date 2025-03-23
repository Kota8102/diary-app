import { api } from '@/lib/api'

// プロフィール画像を取得するAPIリクエスト
export const fetchProfileImage = async (): Promise<string | null> => {
  const response = await api.get('/settings')
  if (!response.data) return null
  return `data:image/jpeg;base64,${response.data}`
}

// プロフィール画像をアップロードするAPIリクエスト
export const uploadProfileImage = async (base64String: string): Promise<void> => {
  await api.post('/settings', base64String, { headers: { 'Content-Type': 'application/json' } })
}
