import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/lib/auth/cognito-auth'
import { Input } from '../components'

export const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = await signIn(username, password)

    if (result.success) {
      navigate('/calendar') // ログイン成功後のリダイレクト先
    } else {
      setErrorMessage(result.message)
    }
  }

  return (
    <div className="flex flex-col h-full p-5 gap-5">
      <h2 className="flex items-center justify-center p-20">ログイン</h2>
      <form onSubmit={handleLogin} className="space-y-7">
        <Input id="username" label="メールアドレス" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        <div>
          <Input id="password" label="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errorMessage && <p className="pt-1 text-sm text-red-500">{errorMessage}</p>}
        </div>
        <div className="flex justify-center w-full text-sm text-light-textPlaceholder">
          <a href="/forgot-password" className="hover:underline">
            パスワードをお忘れの方はこちら
          </a>
        </div>
        <button
          type="submit"
          className="w-full bg-light-buttonPrimaryDefault p-2 rounded hover:bg-light-buttonPrimaryHover transition-colors duration-200"
        >
          ログイン
        </button>
      </form>
    </div>
  )
}
