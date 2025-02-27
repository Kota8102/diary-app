import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getWeekRange } from '../utils/dateUtils'
import { BouquetCard } from './bouquet-card'
import { WeekRangeDisplay } from './week-range-display'

/**
 * ブーケ表示画面のメインコンポーネント
 * 週ごとのブーケを表示する
 */
export const Bouquet = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const today = dayjs().format('YYYY-MM-DD')

  // URLから日付を取得するか、今日の日付を使用
  const getInitialDate = () => {
    const searchParams = new URLSearchParams(location.search)
    const dateParam = searchParams.get('date')
    return dateParam || today
  }

  const [currentDate, setCurrentDate] = useState(getInitialDate())
  const [visibleWeeks, setVisibleWeeks] = useState<string[]>([])

  // 現在の週、前の週、次の週の日付範囲を計算
  const currentWeek = getWeekRange(currentDate)

  // 表示する週を更新
  useEffect(() => {
    // 現在の週を中心に、前後の週も含めて表示
    const weeks = []

    // 前の週を追加
    for (let i = 2; i > 0; i--) {
      const prevDate = dayjs(currentWeek.startDate)
        .subtract(i * 7, 'day')
        .format('YYYY-MM-DD')
      weeks.push(prevDate)
    }

    // 現在の週を追加
    weeks.push(currentWeek.startDate)

    // 次の週を追加
    for (let i = 1; i <= 2; i++) {
      const nextDate = dayjs(currentWeek.startDate)
        .add(i * 7, 'day')
        .format('YYYY-MM-DD')
      weeks.push(nextDate)
    }

    setVisibleWeeks(weeks)

    // URLを更新
    navigate(`?date=${currentDate}`, { replace: true })
  }, [currentDate, currentWeek.startDate, navigate])

  // 週を変更する処理
  const handleWeekChange = (date: Date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD')
    setCurrentDate(dateStr)
  }

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      <WeekRangeDisplay startDate={currentWeek.startDate} endDate={currentWeek.endDate} onWeekChange={handleWeekChange} />

      <div className="grid grid-cols-2 gap-4">
        {visibleWeeks.map((weekStartDate) => {
          const week = getWeekRange(weekStartDate)
          return <BouquetCard key={weekStartDate} date={weekStartDate} label={week.weekLabel} />
        })}
      </div>
    </div>
  )
}
