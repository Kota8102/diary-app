import { getNextDate, getPreviousDate } from '@/utils/dateUtils'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateBouquet } from '../api/create-bouquet'
import { useGetDiaryData } from '../api/get-data'
import { BouquetButton } from './bouquet-button'
import { DateDisplay } from './date-display'
import { FlowerImage } from './flower-image'
import { FlowerNote } from './flower-note'
import { FlowerTitle } from './flower-title'

export type FlowerData = {
  image: string
  title: string
  body: string
  can_create_bouquet: boolean
}

export const Flower = () => {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()

  // 日記データを取得
  const { data, isLoading: isDataLoading, error } = useGetDiaryData(date || '')

  // ブーケ作成のmutation
  const createBouquetMutation = useCreateBouquet()

  // ブーケ作成
  const handleCreateBouquet = async () => {
    try {
      await createBouquetMutation.mutateAsync(date || '')
      alert('ブーケを作成しました')
    } catch (error) {
      console.error('ブーケの作成に失敗しました', error)
      alert('ブーケの作成に失敗しました')
    }
  }

  // 前日の日記へ移動
  const handlePreviousDay = () => {
    if (date) {
      const previousDate = getPreviousDate(date)
      navigate(`/app/flower/${previousDate}`)
    }
  }

  // 翌日の日記へ移動
  const handleNextDay = () => {
    if (date) {
      const nextDate = getNextDate(date)
      navigate(`/app/flower/${nextDate}`)
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
      <div className="flex flex-col h-full">
        <DateDisplay date={new Date(date || '')} />

        <div className="relative">
          <FlowerImage image={data?.image} />

          {/* 日付ナビゲーション矢印 - 画像の横に配置 */}
          <button
            onClick={handlePreviousDay}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10 bg-white/60 rounded-full p-1 shadow-sm"
            aria-label="前日へ"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>前日へ</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNextDay}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 z-10 bg-white/60 rounded-full p-1 shadow-sm"
            aria-label="翌日へ"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>翌日へ</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <BouquetButton canCreateBouquet={data?.can_create_bouquet} onCreateBouquet={handleCreateBouquet} loading={createBouquetMutation.isPending} />

        <div className="flex flex-col flex-grow min-h-0">
          <FlowerTitle title={data?.title} />
          <FlowerNote body={data?.body || ''} />
        </div>
      </div>
    </div>
  )
}
