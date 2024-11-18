import { makeBouquete } from '@/assets/icons'
import { paths } from '@/config/paths'
import { getNextDate, getPreviousDate } from '@/utils/dateUtils'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFlower, useNote, useTitle } from '../api'
import { DateDisplay, ImageDisplay, NoteDisplay } from './'

export const FlowerDiary = () => {
  // 日付を取得
  const { pathname } = useLocation()
  const date = pathname.split('/').pop() || ''

  // 花の画像を取得
  const { data: flowerData } = useFlower({ date })
  const flower = flowerData?.data?.flower ?? ''

  const { data: titleData } = useTitle({ date })
  const title = titleData?.data?.title ?? ''

  const { data: noteData } = useNote({ date })
  const note = noteData?.data?.content ?? ''

  // 前日への移動
  const navigate = useNavigate()
  const handlePrevious = () => {
    const prevDate = getPreviousDate(date)
    navigate(paths.app.flower.getHref(prevDate))
  }

  // 翌日への移動
  const handleNext = () => {
    const nextDate = getNextDate(date)
    navigate(paths.app.flower.getHref(nextDate))
  }
  return (
    <div className="w-full h-full pt-4">
      <div className="pl-4">
        <DateDisplay date={date} />
      </div>

      {/* 画像 - 高さを固定 */}
      <div className="h-40 w-full">
        <ImageDisplay src={flower} onPrevious={handlePrevious} onNext={handleNext} />
      </div>
      <div className="flex-1 flex flex-col gap-1 text-xs">
        <div className="flex justify-end">
          <button type="button" aria-label="Make bouquet">
            <img src={makeBouquete} alt="bouquet" />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <p>Title</p>
          <p className="bg-light-bgText rounded-md px-3 py-2 h-8">{title?.toString()}</p>
        </div>
        <div className="flex flex-col gap-1">
          <NoteDisplay note={note.toString()} date={date} />
        </div>
      </div>
    </div>
  )
}
