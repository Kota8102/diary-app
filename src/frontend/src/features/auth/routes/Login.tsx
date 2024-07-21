import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Input } from '../components'
import { useAuth } from '../utils/cognito-auth'

export const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log(event)
    alert(event)
    const result = await signIn(username, password)
    if (result.success) {
      navigate('/') // ログイン成功後のリダイレクト先
    } else {
      alert(result.message)
    }
  }

  return (
    <div className="flex flex-col h-full p-5 gap-5">
      <h2 className="flex items-center justify-center p-20">ログイン</h2>
      <form
        onSubmit={handleLogin}
        className="space-y-7">
        <Input
          id="username"
          label="メールアドレス"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          id="password"
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-light-buttonPrimaryDefault p-2 rounded hover:bg-light-buttonPrimaryHover transition-colors duration-200">
          ログイン
        </button>
      </form>
    </div>
  )
}
