import { Route, Routes } from 'react-router-dom'

import { MainLayout } from '../../../components/layout'

import { AuthChoice } from './AuthChoice'
import { Login } from './Login'
import { SignUp } from './Signup'

export const AuthRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route
          path="login"
          element={<Login />}
        />
        <Route
          path="signup"
          element={<SignUp />}
        />
        <Route
          path="/"
          element={<AuthChoice />}
        />
      </Routes>
    </MainLayout>
  )
}
