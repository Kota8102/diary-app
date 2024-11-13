import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form/input'
import { useAuth } from '@/lib/auth/cognito-auth'

export const ResetPasswordForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { resetPassword } = useAuth()

  // メールアドレスをlocation stateから取得
  const email = location.state?.email || ''

  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await resetPassword(email, verificationCode, newPassword, confirmPassword)
      if (result.success) {
        alert('パスワードが正常に変更されました')
        navigate('/auth/login')
      } else {
        setErrorMessage(result.message)
      }
    } catch (error) {
      setErrorMessage('予期せぬエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-20">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 mt-2">
          メールに送信された確認コードと
          <br />
          新しいパスワードを入力してください
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="確認コード"
          required
          registration={{}}
        />
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="新しいパスワード"
          required
          registration={{}}
        />
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="新しいパスワード（確認）"
          required
          registration={{}}
        />
      </div>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <Button type="submit" isLoading={isLoading}>
        パスワードを変更
      </Button>

      <div className="text-center">
        <a href="/auth/login" className="text-sm text-light-textDefault hover:underline">
          ログイン画面に戻る
        </a>
      </div>
    </form>
  )
}
