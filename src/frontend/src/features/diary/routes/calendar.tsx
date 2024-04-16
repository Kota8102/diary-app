import jaLocale from '@fullcalendar/core/locales/ja'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'

import { ContentLayout } from '../../../components/layout'

export const Calendar = () => {
  return (
    <div>
      <ContentLayout>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          locales={[jaLocale]}
          locale="ja"
        />
      </ContentLayout>
    </div>
  )
}
