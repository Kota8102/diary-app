import jaLocale from '@fullcalendar/core/locales/ja'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'

import { ContentLayout } from '../../../components/layout'

import '../styles/calendar.css'

export const Calendar = () => {
  const handleDateClick = (arg: any) => {
    console.log(arg.dateStr)
  }

  return (
    <div>
      <ContentLayout pagetitle="calendar">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locales={[jaLocale]}
          locale="en"
          headerToolbar={{
            left: 'title',
            center: '',
            right: '',
          }}
          events={[]}
          dateClick={handleDateClick}
        />
      </ContentLayout>
    </div>
  )
}
