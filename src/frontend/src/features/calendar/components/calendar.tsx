import { vase1, vase2, vase3 } from '@/assets/icons'
import jaLocale from '@fullcalendar/core/locales/ja'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import '../styles/calendar.css'
import { paths } from '@/config/paths'
import { useNavigate } from 'react-router-dom'

export const Calendar = () => {
  const navigate = useNavigate()

  // 日付をクリックした時の処理
  const handleDateClick = (info: DateClickArg) => {
    navigate(paths.app.flower.getHref(info.dateStr))
  }

  return (
    <div className="flex flex-col h-full pt-12">
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
        dateClick={handleDateClick}
        showNonCurrentDates={false}
      />
      <div className="flex justify-end mt-auto items-end">
        <img src={vase1} alt="vase1" className="w-16 h-14" />
        <img src={vase2} alt="vase2" className="w-16 h-20" />
        <img src={vase3} alt="vase3" className="w-16 h-12" />
      </div>
    </div>
  )
}
