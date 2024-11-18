import { api } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import type { CreateDiary } from '@/types/api'

// 日記の入力スキーマ
export const createDiaryInputSchema = z.object({
  date: z.string().min(1, 'Required'),
  content: z.string().min(1, 'Required'),
})

// 日記の入力型
export type CreateDiaryInput = z.infer<typeof createDiaryInputSchema>

// 日記を作成するAPI
export const createDiary = async ({
  data,
}: {
  data: CreateDiaryInput
}): Promise<CreateDiary> => {
  const response = await api.post('/diary', data)
  console.log(response.data)
  return response.data
}

// 日記を作成するミューテーションの設定型
type UseCreateDiaryMutationConfig = MutationConfig<typeof createDiary>

// 日記を作成するミューテーション
export const useCreateDiary = (config?: UseCreateDiaryMutationConfig) => {
  return useMutation({
    mutationFn: createDiary,
    ...config,
  })
}
