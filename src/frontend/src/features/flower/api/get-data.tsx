import { api } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import { useQuery } from '@tanstack/react-query'

import type { FlowerData } from '../components/flower'

// 日記データを取得するAPI
export const getDiaryData = async (date: string): Promise<FlowerData> => {
  const response = await api.get(`/data?date=${date}`)
  return response.data
}

// 日記データを取得するクエリの設定型
type UseGetDiaryDataQueryConfig = QueryConfig<typeof getDiaryData>

// 日記データを取得するクエリ
export const useGetDiaryData = (date: string, config?: UseGetDiaryDataQueryConfig) => {
  return useQuery({
    queryKey: ['diary', date],
    queryFn: () => getDiaryData(date),
    enabled: !!date,
    ...config,
  })
}
