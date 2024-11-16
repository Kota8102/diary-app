import type { ReactNode } from 'react'

import { ProvideAuth } from '@/lib/auth/cognito-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvideAuth>{children}</ProvideAuth>
    </QueryClientProvider>
  )
}
