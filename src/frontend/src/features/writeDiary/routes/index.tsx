import { Route, Routes } from 'react-router-dom'

import { WriteDiary } from './WriteDiary'

export const WriteDiaryRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<WriteDiary />}
      />
    </Routes>
  )
}
