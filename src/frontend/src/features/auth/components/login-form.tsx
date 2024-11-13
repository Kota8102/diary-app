import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form/input'
import { useAuth } from '@/lib/auth/cognito-auth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LoginForm = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ログインフォームの送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await signIn(email, password)
      if (result.success) {
        navigate('/app/diary')
      } else {
        setErrorMessage(result.message || 'ログインに失敗しました')
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
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" required registration={{}} />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" required registration={{}} />
      </div>
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      <div className="flex justify-center py-7">
        <a href="/auth/forgot-password" className="text-sm text-light-textDefault hover:underline">
          パスワードをお忘れの方は<span className="text-light-textDefault">こちら</span>
        </a>
      </div>
      <div className="">
        <Button type="submit" isLoading={isLoading}>
          ログイン
        </Button>
      </div>
    </form>
  )
}
