import jaLocale from '@fullcalendar/core/locales/ja'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'

import { ContentLayout } from '@/components/layout'

import '@/features/diary/styles/calendar.css'

export const CalendarRoute = () => {
  return (
    <div>
      <ContentLayout pagetitle="Calendar" showHeaderIcon={true}>
        <div className="pt-5">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locales={[jaLocale]}
            locale="en"
            headerToolbar={{
              left: 'title',
              center: '',
              right: 'prev,next',
            }}
            height="auto"
          />
        </div>
      </ContentLayout>
    </div>
  )
}