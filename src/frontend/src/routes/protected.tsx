import { MainLayout } from '@/components/layout'
import { Bouquet } from '@/features/bouquet'
import { Diary } from '@/features/diary'
import { Flower } from '@/features/flower'
import { NotFound } from '@/features/notfound'
import { Setting } from '@/features/setting'
import { WriteDiaryRoutes } from '@/features/writeDiary'

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
    path: 'flower/*',
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
