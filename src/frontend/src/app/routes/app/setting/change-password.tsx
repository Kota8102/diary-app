import { AuthLayout } from '@/components/layout'
import { ChangePasswordForm } from '@/features/setting/components/change-password-form'

export const ChangePasswordRoute = () => {
  return (
    <AuthLayout title="パスワードの変更">
      <ChangePasswordForm />
    </AuthLayout>
  )
}
