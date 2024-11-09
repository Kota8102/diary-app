import { ContentLayout } from '@/components/layout'
import { getNextDate, getPreviousDate } from '@/utils/dateUtils'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFlower, useNote, useTitle } from '../api'
import { DateDisplay, ImageDisplay, NoteDisplay } from '../components'

export const Flower = () => {
  // 日付を取得
  const { pathname } = useLocation()
  const date = pathname.split('/').pop() || ''

  const { data: titleData } = useTitle({ date })
  const title = titleData?.data?.title ?? ''

  const { data: noteData } = useNote({ date })
  const note = noteData?.data?.content ?? ''

  const { data: flowerData } = useFlower({ date })
  const flower = flowerData?.data?.flower ?? ''

  const navigate = useNavigate()
  const handlePrevious = () => {
    const prevDate = getPreviousDate(date)
    navigate(`/flower/${prevDate}`)
  }

  // 翌日への移動（必要に応じて）
  const handleNext = () => {
    const nextDate = getNextDate(date)
    navigate(`/flower/${nextDate}`)
  }

  return (
    <ContentLayout pagetitle="Diary">
      <div className="flex flex-col w-full h-full gap-2 justify-between overflow-hidden">
        {/* 日付 */}
        <div className="flex flex-col gap-5">
          <DateDisplay date={date} />
        </div>

        {/* 画像 - 高さを固定 */}
        <div className="h-40 w-full">
          <ImageDisplay src={flower} onPrevious={handlePrevious} onNext={handleNext} />
        </div>

        {/* タイトル、ノート */}
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex justify-end">
            <button type="button" aria-label="Make bouquet">
              <img src="/make_bouquate.svg" alt="bouquet" />
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
    </ContentLayout>
  )
}
