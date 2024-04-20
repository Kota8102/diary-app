import { Outlet, Navigate } from 'react-router-dom'

import { MainLayout } from '../components/layout'
import { Diary } from '../features/diary'
import { DiaryEntryRoutes } from '../features/diaryEntry'
import { NotFound } from '../features/notfound'
import { Setting } from '../features/setting'

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
      { path: '/diary/*', element: <DiaryEntryRoutes /> },
      { path: '/diarylist/*', element: <Diary /> },
      { path: 'setting', element: <Setting /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
