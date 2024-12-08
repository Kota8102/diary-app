import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form/form'
import { Input } from '@/components/ui/form/input'
import { useAuth } from '@/lib/auth/cognito-auth'
import { z } from 'zod'

// バリデーションスキーマの定義
const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'パスワードを入力してください'),
    newPassword: z.string().min(8, '8文字以上入力してください'),
    newPasswordConfirm: z.string().min(1, 'パスワードを入力してください'),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: 'パスワードが一致しません',
    path: ['newPasswordConfirm'],
  })

type ChangePasswordSchema = z.infer<typeof changePasswordSchema>

export const ChangePasswordForm = () => {
  // パスワード変更APIのフック
  const { changePassword, currentAuthenticatedUser } = useAuth()

  // パスワード変更ボタンクリック時の処理
  const onSubmit = async (data: ChangePasswordSchema) => {
    try {
      const user = await currentAuthenticatedUser()
      if (user) {
        await changePassword(user, data.oldPassword, data.newPassword, data.newPasswordConfirm)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form schema={changePasswordSchema} onSubmit={onSubmit}>
      {(form) => (
        <div className="flex flex-col gap-6 pt-6">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" value={field.value} onChange={field.onChange} placeholder="現在のパスワード" required registration={{}} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" value={field.value} onChange={field.onChange} placeholder="新しいパスワード" required registration={{}} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPasswordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="新しいパスワード（確認）"
                    required
                    registration={{}}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">変更</Button>
        </div>
      )}
    </Form>
  )
}
