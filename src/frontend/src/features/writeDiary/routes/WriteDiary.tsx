import { ContentLayout } from '../../../components/layout/ContentLayout'
import { Button } from '../../../components/Elements/Button'
import { useNavigate, useLocation } from 'react-router-dom'
import { vase1, vase2, vase3 } from '../../../assets/icons'

export const WriteDiary = () => {
  // 今日の日付を取得
  const today = new Date()
    .toLocaleDateString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-')

  // 昨日の日付を取得
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday
    .toLocaleDateString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-')
  // ページ遷移用の関数を取得
  const navigateTo = useNavigate()
  const location = useLocation()

  const handleTodaySubmit = () => {
    navigateTo(`${location.pathname}/${today}`)
  }

  const handleYesterdaySubmit = () => {
    navigateTo(`${location.pathname}/${yesterdayStr}`)
  }

  return (
    <ContentLayout pagetitle="">
      <div className="h-full flex flex-col justify-between">
        <div className="flex flex-grow flex-col items-center justify-center">
          <div className="flex justify-center gap-3 items-end">
            <img
              src={vase1}
              alt="Logo"
              className="w-16 h-16"
            />
            <img
              src={vase2}
              alt="Logo"
              className="w-24 h-24"
            />
            <img
              src={vase3}
              alt="Logo"
              className="w-16 h-16"
            />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <Button
            text="今日の日記を書く"
            onClick={handleTodaySubmit}
            css="bg-light-buttonPrimaryDefault hover:bg-light-buttonPrimaryHover"
          />
          <Button
            text="昨日の日記を書く"
            onClick={handleYesterdaySubmit}
            css="bg-light-buttonPrimaryHover hover:bg-light-buttonPrimaryDefault"
          />
        </div>
      </div>
    </ContentLayout>
  )
}
