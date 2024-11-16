import { AuthLayout } from '@/components/layout'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

export const ResetPasswordRoute = () => {
  return (
    <AuthLayout title="パスワード再設定">
      <ResetPasswordForm />
    </AuthLayout>
  )
}
