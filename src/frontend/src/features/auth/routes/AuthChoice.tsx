import type React from 'react'

import logo from '../../../assets/logo.svg'
import { Button } from '../components/button'

export const AuthChoice: React.FC = () => {
  return (
    <div className="flex flex-col justify-between items-center h-screen py-12 px-5">
      <div className="flex flex-grow items-center justify-center">
        <img src={logo} alt="logo" className="w-32 h-32" />
      </div>
      <div className="w-full flex flex-col gap-6">
        <Button path="/auth/consent" text="新規登録" />
        <Button path="/auth/login" text="ログイン" />
      </div>
    </div>
  )
}
