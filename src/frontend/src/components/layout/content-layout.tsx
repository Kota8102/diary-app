import { cn } from '@/utils/cn'
import type React from 'react'
import { Header } from '../Elements/Header'
import { Tab } from '../ui/Tab'

type ContentLayoutProps = {
  children: React.ReactNode
  pagetitle: string
  showHeaderIcon?: boolean
  showTab?: boolean
  className?: string
}

export const ContentLayout = ({ children, pagetitle, showHeaderIcon = false, showTab = true, className }: ContentLayoutProps) => {
  return (
    <div className={cn('flex flex-col h-screen')}>
      <div className={cn('flex flex-col flex-grow overflow-auto pb-6', className)}>
        <Header title={pagetitle} showHeaderIcon={showHeaderIcon} />
        <div className={cn('flex-grow pt-2 px-4')}>{children}</div>
      </div>
      {showTab && <Tab />}
    </div>
  )
}
