import { Route, Routes } from 'react-router-dom'

import { Calendar } from './calendar'

export const Diary = () => {
  return (
    <Routes>
      <Route path="/" element={<Calendar />} />
    </Routes>
  )
}
