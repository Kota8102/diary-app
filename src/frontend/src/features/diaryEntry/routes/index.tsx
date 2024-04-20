import { Route, Routes } from 'react-router-dom'

import { DiaryEntrySelect } from './DiaryEntrySelect'
import { DiaryInput } from './DiaryInput'

export const DiaryEntryRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<DiaryEntrySelect />}
      />
      <Route
        path="input"
        element={<DiaryInput />}
      />
    </Routes>
  )
}
