import { MainLayout } from '@/components/layout'
import { Bouquet } from '@/features/bouquet'
import { Diary } from '@/features/diary'
import { Flower } from '@/features/flower'
import { NotFound } from '@/features/notfound'
import { WriteDiaryRoutes } from '@/features/writeDiary'

import { lazyImport } from '@/utils/lazyImport'

const { Setting } = lazyImport(() => import('@/features/setting'), 'Setting')

export const protectedRoutes = [
  {
    path: '/',
    element: (
      <MainLayout>
        <Diary />
      </MainLayout>
    ), // デフォルトで表示するコンポーネントを指定
  },
  {
    path: '/diary/*',
    element: (
      <MainLayout>
        <WriteDiaryRoutes />
      </MainLayout>
    ),
  },
  {
    path: '/calendar/*',
    element: (
      <MainLayout>
        <Diary />
      </MainLayout>
    ),
  },
  {
    path: 'setting',
    element: (
      <MainLayout>
        <Setting />
      </MainLayout>
    ),
  },
  {
    path: 'bouquet',
    element: (
      <MainLayout>
        <Bouquet />
      </MainLayout>
    ),
  },
  {
    path: 'flower',
    element: (
      <MainLayout>
        <Flower />
      </MainLayout>
    ),
  },
  {
    path: '*',
    element: (
      <MainLayout>
        <NotFound />
      </MainLayout>
    ),
  },
]
