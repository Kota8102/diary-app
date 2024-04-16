import React from 'react'

import { Tab } from '../Elements/Tab'

type ContentLayoutProps = {
  children: React.ReactNode
}

export const ContentLayout = ({ children }: ContentLayoutProps) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-auto p-4">{children}</div>
      <Tab />
    </div>
  )
}
