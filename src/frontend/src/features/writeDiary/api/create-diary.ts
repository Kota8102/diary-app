import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '../../../lib/api'

export const createDiaryInputSchema = z.object({
  date: z.string().min(1, 'Required'),
  content: z.string().min(1, 'Required'),
})

export type CreateDiaryInput = z.infer<typeof createDiaryInputSchema>

export const createDiary = (data: CreateDiaryInput) => {
  return api.post('/diary', data)
}

export const useCreateDiary = () => {
  return useMutation({
    mutationFn: createDiary,
  })
}
