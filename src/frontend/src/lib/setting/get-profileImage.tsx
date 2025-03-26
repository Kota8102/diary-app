import { api } from '@/lib/api'

/**
 * プロフィール画像を取得するAPIリクエスト
 * @returns プロフィール画像のBase64文字列、またはnull
 */
export const fetchProfileImage = async (): Promise<string | null> => {
  try {
    const response = await api.get('/settings')
    if (!response.data) {
      console.error('プロフィール画像のデータが存在しません。')
      return null
    }
    return `data:image/jpeg;base64,${response.data}`
  } catch (error) {
    console.error('プロフィール画像の取得中にエラーが発生しました:', error)
    throw new Error('プロフィール画像の取得に失敗しました。')
  }
}
