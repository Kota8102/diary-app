import { Route, Routes } from 'react-router-dom'

import { MainLayout } from '../../../components/layout'

import { AuthChoice } from './AuthChoice'
import { Login } from './Login'
import { SignUp } from './SignUp'
import { ConfirmSignUp } from './ConfirmSignUp'

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
          path="confirm"
          element={<ConfirmSignUp />}
        />
        <Route
          path="/"
          element={<AuthChoice />}
        />
      </Routes>
    </MainLayout>
  )
}
