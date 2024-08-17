import type React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../lib/auth/cognito-auth'
import { Input } from '../components'

export const SignUp = () => {
  const { signUp } = useAuth() // useAuth フックから signUp 関数を取得
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    const result = await signUp(username, password)
    setIsLoading(false)
    if (!result.success) {
      setError(result.message)
    } else {
      setError('')
      alert('登録成功！確認コードを入力してアカウントを有効化してください。')
      navigate('/auth/confirm')
    }
  }

  return (
    <div className="flex flex-col h-full p-5 gap-5">
      <h2 className="flex items-center justify-center p-20">新規登録</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSignUp} className="space-y-7">
        <Input id="username" type="text" label="メールアドレス" value={username} onChange={(e) => setUsername(e.target.value)} />

        <Input id="password" type="password" label="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-light-buttonPrimaryDefault p-2 rounded hover:bg-light-buttonPrimaryHover transition-colors duration-200"
        >
          {isLoading ? '登録中...' : '新規登録'}
        </button>
      </form>
    </div>
  )
}
