import { api } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import { useQuery } from '@tanstack/react-query'

// レスポンス型の定義
export type BouquetResponse = {
  bouquet: string // base64エンコードされた画像
}

/**
 * 指定した日付のブーケ画像を取得する
 * @param date 日付（YYYY-MM-DD形式）
 * @returns APIレスポンス
 */
export const getBouquet = async (date: string): Promise<BouquetResponse> => {
  const response = await api.get<BouquetResponse>(`/bouquet?date=${date}`)
  return response.data
}

// React Queryフックの定義
export const useGetBouquet = (date: string, config?: QueryConfig<typeof useQuery>) => {
  return useQuery({
    queryKey: ['bouquet', date],
    queryFn: () => getBouquet(date),
    ...config,
  })
}
