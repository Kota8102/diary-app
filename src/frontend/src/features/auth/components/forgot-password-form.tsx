import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form/input'
import { useAuth } from '@/lib/auth/cognito-auth'

export const ForgotPasswordForm = () => {
  const navigate = useNavigate()
  const { forgetPassword } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  // パスワード再設定メール送信
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await forgetPassword(email)
      if (result.success) {
        // 確認コード入力画面へ遷移
        navigate('/auth/reset-password', { state: { email } })
      } else {
        setErrorMessage(result.message || 'パスワード再設定メールの送信に失敗しました')
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
          登録済みのメールアドレスを入力してください。
          <br />
          パスワード再設定用のメールをお送りします。
        </p>
      </div>

      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" required registration={{}} />

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <Button type="submit" isLoading={isLoading}>
        送信する
      </Button>

      <div className="text-center">
        <a href="/auth/login" className="text-sm text-light-textDefault hover:underline">
          ログイン画面に戻る
        </a>
      </div>
    </form>
  )
}
