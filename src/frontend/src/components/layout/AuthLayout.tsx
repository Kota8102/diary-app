import React from 'react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return <div className="h-screen">{children}</div>
}
