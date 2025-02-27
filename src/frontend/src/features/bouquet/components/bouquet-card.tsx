import dayjs from 'dayjs'
import { useLocation } from 'react-router-dom'
import { useGetBouquet } from '../api/get-bouquet'

type BouquetCardProps = {
  date: string
  label: string
}

/**
 * ブーケカードコンポーネント
 * 指定した日付のブーケ画像を表示する
 */
export const BouquetCard = ({ date, label }: BouquetCardProps) => {
  const { data, isLoading, error } = useGetBouquet(date)
  const location = useLocation()

  // 現在選択されている日付を取得
  const getCurrentDate = () => {
    const searchParams = new URLSearchParams(location.search)
    const dateParam = searchParams.get('date')
    return dateParam || dayjs().format('YYYY-MM-DD')
  }

  // 現在の週かどうかを判定（単純に日付文字列の先頭部分を比較）
  const isCurrentWeek = () => {
    // 日付文字列から年と月を取得（例: "2023-01-02" -> "2023-01"）
    const currentDatePrefix = getCurrentDate().substring(0, 7)
    const cardDatePrefix = date.substring(0, 7)

    // 同じ年月で、日付の差が7日以内なら同じ週と見なす
    if (currentDatePrefix === cardDatePrefix) {
      const currentDay = Number.parseInt(getCurrentDate().substring(8, 10), 10)
      const cardDay = Number.parseInt(date.substring(8, 10), 10)
      return Math.abs(currentDay - cardDay) < 7
    }

    return false
  }

  // 現在の週の場合はボーダーを追加
  const cardClasses = isCurrentWeek()
    ? 'bg-white rounded-md p-4 shadow-sm border-2 border-light-buttonPrimaryDefault'
    : 'bg-white rounded-md p-4 shadow-sm'

  return (
    <div className="flex flex-col items-center mb-8">
      {isLoading ? (
        <div className="h-64 w-full max-w-xs flex flex-col items-center bg-light-bgText rounded-md p-4 shadow-sm">
          <div className={`text-gray-700 mb-4 ${isCurrentWeek() ? 'font-bold' : ''}`}>{label}</div>
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      ) : error ? (
        <div className="h-64 w-full max-w-xs flex flex-col items-center bg-light-bgText rounded-md p-4 shadow-sm">
          <div className={`text-gray-700 mb-4 ${isCurrentWeek() ? 'font-bold' : ''}`}>{label}</div>
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500">画像を取得できませんでした</p>
          </div>
        </div>
      ) : data?.bouquet ? (
        <div className={`w-full max-w-xs flex flex-col items-center ${cardClasses}`}>
          <div className={`text-gray-700 mb-4 ${isCurrentWeek() ? 'font-bold' : ''}`}>{label}</div>
          <img src={`data:image/png;base64,${data.bouquet}`} alt="ブーケ画像" className="w-full h-auto" />
        </div>
      ) : (
        <div className="h-64 w-full max-w-xs flex flex-col items-center bg-light-bgText rounded-md p-4 shadow-sm">
          <div className={`text-gray-700 mb-4 ${isCurrentWeek() ? 'font-bold' : ''}`}>{label}</div>
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500">ブーケがありません</p>
          </div>
        </div>
      )}
    </div>
  )
}
