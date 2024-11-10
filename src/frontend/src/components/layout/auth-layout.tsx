import type React from 'react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return <div className="h-screen px-4 pb-16">{children}</div>
}
