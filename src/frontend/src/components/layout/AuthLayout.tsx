import React from 'react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return <div className="min-h-screen py-12 px-5">{children}</div>
}
