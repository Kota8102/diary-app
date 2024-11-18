import type React from 'react'
import { Header } from '../Elements/Header'
import { Tab } from '../ui/Tab'

type ContentLayoutProps = {
  children: React.ReactNode
  pagetitle: string
  showHeaderIcon?: boolean
  showTab?: boolean
}

export const ContentLayout = ({ children, pagetitle, showHeaderIcon = false, showTab = true }: ContentLayoutProps) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col flex-grow overflow-auto pb-6">
        <Header title={pagetitle} showHeaderIcon={showHeaderIcon} />
        <div className="flex-grow pt-2 px-4">{children}</div>
      </div>
      {showTab && <Tab />}
    </div>
  )
}
