import React from 'react'

import { PageTitle } from '../Elements/PageTitle'
import { Tab } from '../Elements/Tab'

type ContentLayoutProps = {
  children: React.ReactNode
  pagetitle: string
}

export const ContentLayout = ({ children, pagetitle }: ContentLayoutProps) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-auto p-4 h-screen">
        <PageTitle title={pagetitle} />
        <div className="pt-4">{children}</div>
      </div>
      <Tab />
    </div>
  )
}
