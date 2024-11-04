import type React from 'react'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom' // useLocationをインポート

import { AuthLayout } from '@/components/layout'
import { useAuth } from '@/lib/auth/cognito-auth'
import { Input } from '../components'

export const ConfirmSignUp = () => {
  const { confirmSignUp, signIn } = useAuth()
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { username, password } = location.state || {} // stateからusernameとpasswordを取得

  const handleConfirmSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!username || !password) {
      setError('不正なアクセスです。再度新規登録を行ってください。')
      return
    }
    setIsLoading(true)
    try {
      const confirmResult = await confirmSignUp(username, password, verificationCode)
      if (confirmResult.success) {
        const signInResult = await signIn(username, password)
        if (signInResult.success) {
          alert('メールアドレスの検証に成功し、ログインしました！')
          navigate('/')
        } else {
          alert('メールアドレスの検証に成功しました。ログインしてください。')
          navigate('/auth/login')
        }
      } else {
        setError(confirmResult.message)
      }
    } catch (err) {
      setError('確認処理中にエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col h-full p-5 gap-5">
        <h2 className="flex items-center justify-center p-20">メールアドレス検証</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleConfirmSignUp} className="space-y-7">
          <Input
            id="verificationCode"
            type="text"
            label="検証コード"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-light-buttonPrimaryDefault p-2 rounded hover:bg-light-buttonPrimaryHover transition-colors duration-200"
          >
            {isLoading ? '確認中...' : 'アカウントを確認'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
