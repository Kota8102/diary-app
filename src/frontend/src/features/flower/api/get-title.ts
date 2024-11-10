import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import type { Title } from '@/types/api'

// タイトルを取得する関数
// 指定された日付に基づいてタイトルを取得するAPIリクエストを行う
export const getTitle = ({
  date,
}: {
  date: string
}): Promise<{
  data: {
    title: Title
  }
}> => {
  return api.get('/title', {
    params: {
      date,
    },
  })
}

// タイトル取得用のクエリオプションを生成する関数
// この関数は、React Queryのキャッシュキーとクエリ関数を設定する
export const getTitleQueryOptions = (date: string) => {
  return queryOptions({
    queryKey: ['title', date], // キャッシュキーも日付に基づいて一意にする
    queryFn: () => getTitle({ date }),
  })
}

// useTitleフックのオプション型定義
type UseTitleOptions = {
  queryConfig?: QueryConfig<typeof getTitleQueryOptions>
}

// タイトルを取得するためのカスタムフック
// このフックは、指定された日付に基づいてタイトルを取得し、
// React Queryの機能（ローディング状態、エラー処理など）を利用可能にする
export const useTitle = ({ queryConfig = {}, date }: UseTitleOptions & { date: string }) => {
  return useQuery({
    ...getTitleQueryOptions(date),
    ...queryConfig,
    // 追加のクエリ設定があれば上書きする
  })
}
