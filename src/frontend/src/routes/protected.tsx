import { Outlet, Navigate } from 'react-router-dom'

import { MainLayout } from '../components/layout'
import { Bouquet } from '../features/bouquet'
import { Diary } from '../features/diary'
// import { DiaryEntryRoutes } from '../features/diaryEntry'
import { Flower } from '../features/flower'
import { NotFound } from '../features/notfound'
import { Setting } from '../features/setting'
import { WriteDiaryRoutes } from '../features/writeDiary'

const App = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}

export const protectedRoutes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Navigate
            to="/diary"
            replace
          />
        ),
      },
      { path: '/diary/*', element: <WriteDiaryRoutes /> },
      { path: '/calendar/*', element: <Diary /> },
      { path: 'setting', element: <Setting /> },
      { path: 'bouquet', element: <Bouquet /> },
      { path: 'flower', element: <Flower /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
