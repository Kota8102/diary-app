import { AuthLayout } from '@/components/layout'
import { TermsCheck } from '@/features/auth/components/terms-check'

export const TermsRoute: React.FC = () => {
  return (
    <AuthLayout title="同意書">
      <TermsCheck />
    </AuthLayout>
  )
}
