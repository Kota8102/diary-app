import { api } from '@/lib/api'

/**
 * プロフィール画像をアップロードするAPIリクエスト
 * @param base64String アップロードする画像のBase64文字列
 */
export const uploadProfileImage = async (base64String: string): Promise<void> => {
  try {
    await api.post('/settings', base64String, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('プロフィール画像のアップロード中にエラーが発生しました:', error)
    throw new Error('プロフィール画像のアップロードに失敗しました。')
  }
}
