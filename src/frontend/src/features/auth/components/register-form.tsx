import { useState } from 'react'
import { type FieldError, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form/input'

import { useAuth } from '@/lib/auth/cognito-auth'

type RegisterFormData = {
  email: string
  password: string
}

export const RegisterForm = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [resultMessage, setResultMessage] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>()

  // 新規登録フォームの送信処理
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setResultMessage('')
    try {
      const result = await signUp(data.email, data.password)
      if (result.success) {
        navigate('/auth/verify-email')
      } else {
        setResultMessage(result.message || 'エラーが発生しました')
      }
    } catch (error) {
      setResultMessage('予期せぬエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pt-20">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-y-6">
          <Input
            registration={register('email', {
              required: 'メールアドレスは必須です',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '有効なメールアドレスを入力してください',
              },
            })}
            type="email"
            placeholder="メールアドレス"
            error={errors.email as FieldError}
          />
          <Input
            registration={register('password', {
              required: 'パスワードは必須です',
              minLength: {
                value: 8,
                message: 'パスワードは8文字以上で入力してください',
              },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                message: 'パスワードは英字・数字・記号を含む必要があります',
              },
            })}
            type="password"
            placeholder="パスワード"
            error={errors.password as FieldError}
          />
        </div>
        <div className="pt-20">
          <Button type="submit" isLoading={isLoading}>
            新規登録
          </Button>
        </div>
        {resultMessage && <div className="mt-4 text-red-500 text-sm">{resultMessage}</div>}
      </form>
    </div>
  )
}
