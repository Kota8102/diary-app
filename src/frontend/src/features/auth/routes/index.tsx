import { Route, Routes } from 'react-router-dom'

import { AuthChoice } from './AuthChoice'
import { Login } from './Login'

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route
        path="login"
        element={<Login />}
      />
      <Route
        path="/"
        element={<AuthChoice />}
      />
    </Routes>
  )
}
