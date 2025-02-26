import { api } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDiary,
    onSuccess: (data, variables, context) => {
      // 日記作成成功後、日記一覧と履歴のキャッシュを無効化して再取得を促す
      queryClient.invalidateQueries({ queryKey: ['diary'] })
      queryClient.invalidateQueries({ queryKey: ['diary-history'] })

      // 元のonSuccessがあれば実行
      if (config?.onSuccess) {
        config.onSuccess(data, variables, context)
      }
    },
    ...config,
  })
}
