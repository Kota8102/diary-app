import { Button } from '../../../components/Elements/Button'
import { MainLayout } from '../../../components/layout'

export const AuthChoice = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-full">
        <Button
          path="/login"
          text="ログイン"
        />
      </div>
    </MainLayout>
  )
}