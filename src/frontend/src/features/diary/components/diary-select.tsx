import { vase1, vase2, vase3 } from '@/assets/icons'
import { Button } from '@/components/ui/button'

import { getPreviousDate, getToday } from '@/utils/dateUtils'
import { useLocation, useNavigate } from 'react-router-dom'

export const DiarySelect = () => {
  const navigateTo = useNavigate()
  const location = useLocation()

  // 今日の日記を書く
  const handleTodaySubmit = () => {
    navigateTo(`${location.pathname}/${getToday()}`)
  }

  // 昨日の日記を書く
  const handleYesterdaySubmit = () => {
    navigateTo(`${location.pathname}/${getPreviousDate(getToday())}`)
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex flex-grow flex-col items-center justify-center">
        <div className="flex justify-center gap-3 items-end">
          <img src={vase1} alt="Logo" className="w-16 h-16" />
          <img src={vase2} alt="Logo" className="w-24 h-24" />
          <img src={vase3} alt="Logo" className="w-16 h-16" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button onClick={handleTodaySubmit}>今日の日記を書く</Button>
        <Button onClick={handleYesterdaySubmit} className="bg-light-buttonPrimaryHover hover:bg-light-buttonPrimaryDefault">
          昨日の日記を書く
        </Button>
      </div>
    </div>
  )
}
