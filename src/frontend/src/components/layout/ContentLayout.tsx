import type React from 'react'
import { Tab } from '../Elements/Tab'

type ContentLayoutProps = {
  children: React.ReactNode
  pagetitle: string
}

export const ContentLayout = ({ children, pagetitle }: ContentLayoutProps) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col flex-grow overflow-auto p-5">
        {pagetitle && <h1 className="text-2xl text-light-textPlaceholder pl-1 pb-2">{pagetitle}</h1>}
        <div className="flex-grow pt-4">{children}</div>
      </div>
      <Tab />
    </div>
  )
}
