import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProvideAuth } from './features/auth/utils/cognito-auth'
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
