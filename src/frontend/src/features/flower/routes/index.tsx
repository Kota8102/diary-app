import { Route, Routes } from 'react-router-dom'

import { Flower } from './flower'

export const FlowerRoutes = () => {
  return (
    <Routes>
      <Route path="/:date" element={<Flower />} />
    </Routes>
  )
}
