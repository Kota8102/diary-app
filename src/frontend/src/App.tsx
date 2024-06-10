import { ProvideAuth } from './features/auth/utils/cognito-auth'
import { AppRoutes } from './routes'

const App = () => {
  return (
    <ProvideAuth>
      <AppRoutes />
    </ProvideAuth>
  )
}

export default App
