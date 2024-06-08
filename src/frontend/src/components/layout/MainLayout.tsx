import React from 'react'

type MainLayoutProps = {
  children: React.ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return <div className="h-screen bg-light-bgDefault min-h-screen">{children}</div>
}
