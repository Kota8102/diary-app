import React from 'react'

type MainLayoutProps = {
  children: React.ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return <div className="min-h-screen overflow-x-hidden bg-light-bgDefault">{children}</div>
}
