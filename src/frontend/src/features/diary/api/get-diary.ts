import { api } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import type { Note } from '@/types/api'

// 日記の取得パラメータスキーマ
export const getDiaryParamsSchema = z.object({
  diary_id: z.string().optional(),
  date: z.string().optional(),
})

// 日記の取得パラメータ型
export type GetDiaryParams = z.infer<typeof getDiaryParamsSchema>

// 日記を取得するAPI
export const getDiary = async ({
  params,
}: {
  params?: GetDiaryParams
}): Promise<Note> => {
  const response = await api.get('/diary', { params })
  return response.data
}

// 日記の履歴を取得するパラメータスキーマ
export const getDiaryHistoryParamsSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
})

// 日記の履歴を取得するパラメータ型
export type GetDiaryHistoryParams = z.infer<typeof getDiaryHistoryParamsSchema>

// 日記の履歴を取得するAPI
export const getDiaryHistory = async ({
  params,
}: {
  params?: GetDiaryHistoryParams
}): Promise<Note[]> => {
  const response = await api.get('/diary/history', { params })
  return response.data
}

// 特定の日記を取得するAPI
export const getDiaryById = async (diary_id: string): Promise<Note> => {
  const response = await api.get(`/diary/${diary_id}`)
  return response.data
}

// 日記を取得するクエリの設定型
type UseGetDiaryQueryConfig = QueryConfig<typeof getDiary>

// 日記を取得するクエリフック
export const useGetDiary = (params?: GetDiaryParams, config?: UseGetDiaryQueryConfig) => {
  return useQuery({
    queryKey: ['diary', params],
    queryFn: () => getDiary({ params }),
    ...config,
  })
}

// 日記の履歴を取得するクエリの設定型
type UseGetDiaryHistoryQueryConfig = QueryConfig<typeof getDiaryHistory>

// 日記の履歴を取得するクエリフック
export const useGetDiaryHistory = (params?: GetDiaryHistoryParams, config?: UseGetDiaryHistoryQueryConfig) => {
  return useQuery({
    queryKey: ['diary-history', params],
    queryFn: () => getDiaryHistory({ params }),
    ...config,
  })
}

// 特定の日記を取得するクエリの設定型
type UseGetDiaryByIdQueryConfig = QueryConfig<typeof getDiaryById>

// 特定の日記を取得するクエリフック
export const useGetDiaryById = (diary_id: string, config?: UseGetDiaryByIdQueryConfig) => {
  return useQuery({
    queryKey: ['diary', diary_id],
    queryFn: () => getDiaryById(diary_id),
    enabled: !!diary_id,
    ...config,
  })
}
