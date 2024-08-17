import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type React from 'react'
import { ProvideAuth } from './lib/auth/cognito-auth'
import { AppRoutes } from './routes'

// QueryClient のインスタンスを作成
const queryClient = new QueryClient()

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvideAuth>
        <AppRoutes />
      </ProvideAuth>
    </QueryClientProvider>
  )
}

export default App
