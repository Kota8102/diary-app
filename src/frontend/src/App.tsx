import { AppRoutes } from './routes'
import { ProvideAuth } from './features/auth/cognito-auth';

function App() {
  return (
    <ProvideAuth>
      <AppRoutes />
    </ProvideAuth>
  );

}

export default App