import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form/input'
import { useAuth } from '@/lib/auth/cognito-auth'

export const VerifyEmailForm = () => {
  const navigate = useNavigate()
  const { confirmSignUp } = useAuth()

  const [verificationCode, setVerificationCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await confirmSignUp(email, password, verificationCode)
      if (result.success) {
        navigate('/auth/login')
      } else {
        setErrorMessage(result.message || '検証に失敗しました')
      }
    } catch (error) {
      setErrorMessage('予期せぬエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-20">
      <div className="flex flex-col gap-2">
        <Input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="確認コード"
          required
          registration={{}}
        />

        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" required registration={{}} />

        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" required registration={{}} />
      </div>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <Button type="submit" isLoading={isLoading}>
        検証する
      </Button>

      <div className="text-center">
        <a href="/auth/login" className="text-sm text-light-textDefault hover:underline">
          ログイン画面に戻る
        </a>
      </div>
    </form>
  )
}
