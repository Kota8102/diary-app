import type { AxiosResponse } from 'axios'

export type ApiResponse<T = unknown> = AxiosResponse<T>

export type Entity<T> = {
  [K in keyof T]: T[K]
}

export type Title = Entity<{
  title: string
}>

// export type Note = Entity<{
//   note: string
// }>

export type Note = Entity<{
  updated_at: string
  content: string
  user_id: string
  date: string
  created_at: string
  diary_id: string
  is_deleted: boolean
}>
