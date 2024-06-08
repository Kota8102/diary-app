import jaLocale from '@fullcalendar/core/locales/ja'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'

import { ContentLayout } from '../../../components/layout'

import '../styles/calendar.css'

export const Calendar = () => {
  return (
    <div>
      <ContentLayout pagetitle="Calendar">
        <div className="pt-5">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locales={[jaLocale]}
            locale="en"
            headerToolbar={{
              left: 'title',
              center: '',
              right: 'today prev,next',
            }}
            height="auto"
          />
        </div>
      </ContentLayout>
    </div>
  )
}
