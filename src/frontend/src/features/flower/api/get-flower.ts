import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'

export const getFlower = ({
  date,
}: {
  date: string
}): Promise<{
  data: {
    flower: string
  }
}> => {
  return api.get('/flower', {
    params: {
      date,
    },
  })
}

export const getFlowerQueryOptions = (date: string) => {
  return queryOptions({
    queryKey: ['flower', date], // キャッシュキーも日付に基づいて一意にする
    queryFn: () => getFlower({ date }),
  })
}

type UseFlowerOptions = {
  queryConfig?: QueryConfig<typeof getFlowerQueryOptions>
}

export const useFlower = ({ queryConfig = {}, date }: UseFlowerOptions & { date: string }) => {
  return useQuery({
    ...getFlowerQueryOptions(date),
    ...queryConfig,
  })
}
