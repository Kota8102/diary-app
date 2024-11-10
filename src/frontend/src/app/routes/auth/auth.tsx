import { AuthLayout } from '@/components/layout'
import { AuthChoice } from '@/features/auth/components/auth-choice'

export const AuthChoiceRoute: React.FC = () => {
  return (
    <AuthLayout>
      <AuthChoice />
    </AuthLayout>
  )
}
