import { Route, Routes } from 'react-router-dom'

import { WriteDiary } from './WriteDiary'
import { WriteDiaryInput } from './WriteDiaryInput'

export const WriteDiaryRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<WriteDiary />}
      />
      <Route
        path="/:date"
        element={<WriteDiaryInput />}
      />
    </Routes>
  )
}
