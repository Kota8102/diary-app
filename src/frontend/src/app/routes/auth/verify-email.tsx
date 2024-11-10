import type React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/layout'
import { Input } from '@/features/auth/components/input'
import { useAuth } from '@/lib/auth/cognito-auth'

export const VerifyEmailRoute = () => {
  const { confirmSignUp, signIn } = useAuth()
  const [verificationCode, setVerificationCode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleConfirmSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const confirmResult = await confirmSignUp(username, password, verificationCode)
      if (confirmResult.success) {
        // 確認成功後、自動的にサインインを試みる
        const signInResult = await signIn(username, password)
        if (signInResult.success) {
          alert('メールアドレスの検証に成功し、ログインしました！')
          navigate('/') // ルートページにリダイレクト
        } else {
          // サインインに失敗した場合、ログインページに遷移
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
          <Input id="username" type="text" label="メールアドレス" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input id="password" type="password" label="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
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
