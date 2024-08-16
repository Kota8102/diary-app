import { Route, Routes } from 'react-router-dom'

import { MainLayout } from '../../../components/layout'

import { AuthChoice } from './AuthChoice'
import { ConfirmSignUp } from './ConfirmSignUp'
import { ConsentForm } from './ConsentForm'
import { Login } from './Login'
import { SignUp } from './SignUp'

export const AuthRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="confirm" element={<ConfirmSignUp />} />
        <Route path="consent" element={<ConsentForm />} />
        <Route path="/" element={<AuthChoice />} />
      </Routes>
    </MainLayout>
  )
}
