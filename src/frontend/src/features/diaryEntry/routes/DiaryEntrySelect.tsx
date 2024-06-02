import { ContentLayout } from '../../../components/layout/ContentLayout'
import { Button } from '../components/button'


export const DiaryEntrySelect = () => {
  // 今日の日付をYYYY/MM/DD形式で取得
  const today = new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
  })

  // 昨日の日付を取得
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
  })

  return (
    <ContentLayout>
      <div className="h-full flex flex-col items-center gap-20 justify-center">
        <Button
          text="今日の日記"
          path={`/diary/input?date=${today}`}
          backgroundColor="#A16B3B"
        />
        <Button
          text="昨日の日記"
          path={`/diary/input?date=${yesterdayStr}`}
          backgroundColor="#788083"
        />
      </div>
    </ContentLayout>
  )
}
