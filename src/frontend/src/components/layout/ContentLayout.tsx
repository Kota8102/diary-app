import type React from 'react'
import { Header } from '../Elements/Header'
import { Tab } from '../ui/Tab'

type ContentLayoutProps = {
  children: React.ReactNode
  pagetitle: string
  showHeaderIcon?: boolean
}

export const ContentLayout = ({ children, pagetitle, showHeaderIcon = false }: ContentLayoutProps) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col flex-grow overflow-auto px-4 pb-6">
        <Header title={pagetitle} showHeaderIcon={showHeaderIcon} />
        <div className="flex-grow pt-2 pl-1">{children}</div>
      </div>
      <Tab />
    </div>
  )
}
