import dayjs from 'dayjs'
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

type WeekRangeDisplayProps = {
  startDate: string
  endDate: string
  onWeekChange: (date: Date) => void
}

/**
 * 週の日付範囲を表示するコンポーネント
 * 日付選択機能付き
 */
export const WeekRangeDisplay = ({ startDate, endDate, onWeekChange }: WeekRangeDisplayProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const startDateObj = dayjs(startDate).toDate()

  const formatDate = (dateStr: string) => {
    const date = dayjs(dateStr)
    return `${date.year()} / ${String(date.month() + 1).padStart(2, '0')} / ${String(date.date()).padStart(2, '0')}`
  }

  const handleDateChange = (date: Date | null) => {
    if (date) {
      onWeekChange(date)
      setIsOpen(false)
    }
  }

  const toggleDatePicker = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative w-full bg-light-bgText rounded-md py-3 px-4 mb-6">
      <div className="text-center text-gray-700 text-lg">
        {formatDate(startDate)} ~ {formatDate(endDate)}
      </div>
      <button type="button" className="absolute right-4 top-1/2 transform -translate-y-1/2" aria-label="日付範囲を選択" onClick={toggleDatePicker}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <title>下矢印</title>
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full left-0">
          <DatePicker
            selected={startDateObj}
            onChange={handleDateChange}
            inline
            calendarClassName="bg-white shadow-lg rounded-md border border-gray-200"
            showWeekNumbers
            weekLabel="週"
          />
        </div>
      )}
    </div>
  )
}
