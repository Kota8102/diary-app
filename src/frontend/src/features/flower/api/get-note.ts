import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api'
import type { Note } from '@/types/api'
import type { QueryConfig } from '@/lib/react-query'

// 指定された日付に基づいてタイトルを取得するAPIリクエストを行う
export const getNote = ({
  date
}: {
  date: string
}): Promise<{ title: Note }> => {
  return api.get('/diary', {
    params: {
      date
    }
  })
}

// この関数は、React Queryのキャッシュキーとクエリ関数を設定する
export const getNoteQueryOptions = (date: string) => {
  return queryOptions({
    queryKey: ['diary', date], // キャッシュキーも日付に基づいて一意にする
    queryFn: () => getNote({ date }),
  });
};

type UseNoteOptions = {
  queryConfig?: QueryConfig<typeof getNoteQueryOptions>;
};


export const useNote = ({ queryConfig = {}, date }: UseNoteOptions & { date: string }) => {
  return useQuery({
    ...getNoteQueryOptions(date),
    ...queryConfig,
    // 追加のクエリ設定があれば上書きする
  });
};