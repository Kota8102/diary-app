import React from 'react'

import logo from '../../../assets/logo.svg'
import { AuthLayout } from '../../../components/layout'
import { Button } from '../components/button'

export const AuthChoice: React.FC = () => {
  return (
    <AuthLayout>
      <div className="flex flex-col justify-between items-center min-h-screen py-12 bg-light-bgDefault">
        <div className="flex flex-grow items-center justify-center">
          <img
            src={logo}
            alt="logo"
            className="w-32 h-32"
          />
        </div>
        <div className="w-full flex flex-col gap-6 px-4">
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
    </AuthLayout>
  )
}
