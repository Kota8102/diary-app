import { ContentLayout } from '@/components/layout'

import { Calendar } from '@/features/calendar/components/calendar'

export const CalendarRoute = () => {
  return (
    <div>
      <ContentLayout pagetitle="Calendar" showHeaderIcon={true} className="pb-0">
        <Calendar />
      </ContentLayout>
    </div>
  )
}
