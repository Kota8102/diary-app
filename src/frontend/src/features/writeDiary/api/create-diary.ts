import { z } from 'zod';

import { api } from '../../../hooks/api'
import { ApiResponse } from '../../../types/api'

export const createDiaryInputSchema = z.object({
  date: z.string().min(1, 'Required'),
  content: z.string().min(1, 'Required'),
});

export type CreateDiaryInput = z.infer<typeof createDiaryInputSchema>;

export const createDiary = ({ data }: { data: CreateDiaryInput; }): Promise<ApiResponse> => {
  return api.post('/diary', data);
};
