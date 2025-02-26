import type { AxiosResponse } from 'axios'

export type ApiResponse<T = unknown> = AxiosResponse<T>

export type Entity<T> = {
  [K in keyof T]: T[K]
}

// 日記のタイトル型
export type Title = Entity<{
  title: string
}>

// 日記の内容型
export type Note = Entity<{
  updated_at: string
  content: string
  user_id: string
  date: string
  created_at: string
  diary_id: string
  is_deleted: boolean
}>

// 日記の作成入力型
export type CreateDiary = Entity<{
  message: string
  flower_id: string
  flower_image: string
}>

// ブーケの作成レスポンス型
export type CreateBouquet = Entity<{
  message: string
}>
