import type React from 'react'

type AuthLayoutProps = {
  title?: string
  children: React.ReactNode
}
export const AuthLayout = ({ title, children }: AuthLayoutProps) => {
  return (
    <div className="flex flex-col h-screen px-4 pb-16 bg-light-bgDefault ">
      {title && <h1 className="text-base pt-20 text-light-textDefault text-center">{title}</h1>}
      <div className="flex-1">{children}</div>
    </div>
  )
}
