import logo from '../../../assets/logo.svg'
import { MainLayout } from '../../../components/layout'
import { Button } from '../components/button'

export const AuthChoice = () => {
  return (
    <MainLayout>
      <div className="flex flex-col justify-between items-center min-h-screen py-4">
        <div className="flex flex-grow items-center">
          <img
            src={logo}
            alt="logo"
          />
        </div>
        <div className="w-full flex flex-col gap-3 px-4">
          <Button
            path="/auth/signup"
            text="新規登録"
          />
          <Button
            path="/auth/login"
            text="ログイン"
          />
        </div>
      </div>
    </MainLayout>
  )
}
