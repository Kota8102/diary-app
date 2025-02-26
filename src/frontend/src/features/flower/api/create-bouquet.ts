import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'

// レスポンス型の定義
export type BouquetResponse = {
  message: string
  bouquet_url: string
}

/**
 * ブーケを作成する
 * @param date 日付
 * @returns APIレスポンス
 */
export const createBouquet = async (date: string): Promise<BouquetResponse> => {
  const response = await api.post<BouquetResponse>(`/bouquet?date=${date}`)
  return response.data
}

/**
 * ブーケ作成のReact Query Hook
 */
export const useCreateBouquet = () => {
  return useMutation({
    mutationFn: createBouquet,
  })
}
