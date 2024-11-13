import { AuthLayout } from '@/components/layout/auth-layout'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export const ForgotPasswordRoute = () => {
  return (
    <AuthLayout title="パスワード再設定">
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
