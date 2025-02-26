import { paths } from '@/config/paths'
import { api } from '@/lib/api'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetDiaryData } from '../api/get-data'

export type FlowerData = {
  image: string
  title: string
  body: string
  can_create_bouquet: boolean
}

export const Flower = () => {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const [loading, setLoading] = useState(false)

  // 日記データを取得
  const { data, isLoading: isDataLoading, error } = useGetDiaryData(date || '')

  // 前日・翌日の日付を計算
  const currentDate = date ? new Date(date) : new Date()
  const prevDate = new Date(currentDate)
  prevDate.setDate(currentDate.getDate() - 1)
  const nextDate = new Date(currentDate)
  nextDate.setDate(currentDate.getDate() + 1)

  // YYYY-MM-DD形式に変換
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const prevDateStr = formatDate(prevDate)
  const nextDateStr = formatDate(nextDate)

  // 日付を表示用にフォーマット
  const getMonthStr = (date: Date) => {
    const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
    return months[date.getMonth()]
  }

  const monthStr = getMonthStr(currentDate)
  const dayStr = currentDate.getDate()

  // 編集ページに遷移
  const handleEdit = () => {
    navigate(paths.app.diary.getHref())
  }

  // 前日の日記に遷移
  const handlePrev = () => {
    navigate(paths.app.flower.getHref(prevDateStr))
  }

  // 翌日の日記に遷移
  const handleNext = () => {
    navigate(paths.app.flower.getHref(nextDateStr))
  }

  // ブーケ作成
  const handleCreateBouquet = async () => {
    try {
      setLoading(true)
      await api.post('/data')
      alert('ブーケを作成しました')
    } catch (error) {
      console.error('ブーケの作成に失敗しました', error)
      alert('ブーケの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (isDataLoading) {
    return <div className="flex items-center justify-center h-full">読み込み中...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-full">エラーが発生しました</div>
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* ヘッダー */}
      <div className="px-4 pt-6 pb-2">
        <div className="text-2xl font-medium text-light-textDefault">Diary</div>
        <div className="flex items-baseline">
          <div className="text-xl font-normal text-light-textDefault">{monthStr}</div>
          <div className="text-8xl font-medium ml-4 text-light-textDefault">{dayStr}</div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-grow overflow-auto px-4">
        <div className="flex flex-col items-center mb-4">
          {data?.image && <img src={`data:image/jpeg;base64,${data.image}`} alt="Flower" className="max-w-full h-auto" />}
        </div>

        {/* ブーケ作成ボタン */}
        {data?.can_create_bouquet && (
          <div className="relative">
            <div className="absolute right-0 top-[-40px]">
              <button
                type="button"
                className="bg-[#D9A68E] text-white px-4 py-1 rounded-md cursor-pointer"
                onClick={handleCreateBouquet}
                onKeyUp={handleCreateBouquet}
                aria-label="ブーケを作成する"
                disabled={loading}
              >
                Make Bouquate
              </button>
            </div>
          </div>
        )}

        {/* タイトルとノート */}
        <div className="mt-8">
          <div className="text-xl mb-2 text-light-textDefault">Title</div>
          <div className="bg-light-cardBackground p-4 rounded-md mb-4">{data?.title || ''}</div>

          <div className="text-xl mb-2 text-light-textDefault">Note</div>
          <div className="bg-light-cardBackground p-4 rounded-md relative">
            <div className="whitespace-pre-wrap">{data?.body || ''}</div>
            <button type="button" className="absolute bottom-4 right-4" onClick={handleEdit} aria-label="日記を編集する">
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.862 4.487L18.549 2.799C18.9007 2.44733 19.3777 2.25005 19.875 2.25005C20.3723 2.25005 20.8493 2.44733 21.201 2.799C21.5527 3.15068 21.75 3.62766 21.75 4.125C21.75 4.62235 21.5527 5.09933 21.201 5.451L10.582 16.07C10.0579 16.5944 9.40186 16.9717 8.681 17.162L6 18L6.838 15.319C7.02826 14.5981 7.40557 13.9421 7.93 13.418L16.862 4.487Z"
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M14.5 6.5L17.5 9.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between px-4 py-2 absolute w-full top-1/2 transform -translate-y-1/2 pointer-events-none">
        <button type="button" className="text-3xl text-light-textDefault pointer-events-auto" onClick={handlePrev} aria-label="前の日記へ">
          &lt;
        </button>
        <button type="button" className="text-3xl text-light-textDefault pointer-events-auto" onClick={handleNext} aria-label="次の日記へ">
          &gt;
        </button>
      </div>

      {/* 共有ボタン */}
      <div className="absolute top-6 right-4">
        <button type="button" className="text-light-textDefault" aria-label="日記を共有する">
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12C9 11.518 8.886 11.062 8.684 10.658M8.684 13.342C8.2399 14.3279 7.4404 15.1201 6.4492 15.5555C5.458 15.9909 4.34139 16.0461 3.30277 15.7114C2.26415 15.3767 1.36368 14.6719 0.769547 13.7242C0.175418 12.7765 -0.0716223 11.6439 0.0288116 10.5204C0.129245 9.39685 0.570171 8.34306 1.27595 7.51732C1.98173 6.69158 2.91464 6.14161 3.9363 5.5686C4.95795 5.13513 6.08156 5.00274 7.15675 5.19327C8.23195 5.38379 9.20766 5.8858 9.95 6.636M8.684 13.342L9.95 6.636M9.95 6.636L9.5 7.5M15.316 13.342C15.7601 14.3279 16.5596 15.1201 17.5508 15.5555C18.542 15.9909 19.6586 16.0461 20.6972 15.7114C21.7359 15.3767 22.6363 14.6719 23.2305 13.7242C23.8246 12.7765 24.0716 11.6439 23.9712 10.5204C23.8708 9.39685 23.4298 8.34306 22.7241 7.51732C22.0183 6.69158 21.0854 6.14161 20.0637 5.5686C19.0421 5.13513 17.9184 5.00274 16.8432 5.19327C15.768 5.38379 14.7923 5.8858 14.05 6.636M15.316 13.342C15.114 12.938 15 12.482 15 12C15 11.518 15.114 11.062 15.316 10.658M15.316 13.342L14.05 6.636M14.05 6.636L14.5 7.5M12 9V15M12 15L10 13M12 15L14 13"
              stroke="#6B7280"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
