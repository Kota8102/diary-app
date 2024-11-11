import { AuthLayout } from '@/components/layout'
import { VerifyEmailForm } from '@/features/auth/components/verify-email-form'

export const VerifyEmailRoute = () => {
  return (
    <AuthLayout title="メールアドレス検証">
      <VerifyEmailForm />
    </AuthLayout>
  )
}
