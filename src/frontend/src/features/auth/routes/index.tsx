import { Route, Routes } from 'react-router-dom'
import { AuthChoice } from './AuthChoice'
import { Login } from './Login'
import { SignUp } from './SignUp'


export const AuthRoutes = () => {
  return (
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
  )
}
