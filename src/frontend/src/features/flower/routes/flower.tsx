import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { ContentLayout } from '@/components/layout'

import { useLocation } from 'react-router-dom'

import { useFlower } from '../api/get-flower'
import { useNote } from '../api/get-note'
import { useTitle } from '../api/get-title'
import { DateDisplay } from '../components/DateDisplay'

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
  console.log(flower)

  return (
    <ContentLayout pagetitle="Diary">
      <div className="flex flex-col w-full h-full gap-5 justify-between overflow-hidden">
        <div className="flex flex-col gap-5">
          <DateDisplay date={date} />
        </div>

        <div className="flex flex-col gap-1 text-xs mt-auto">
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
            <p>Note</p>
            <textarea className="bg-light-bgText rounded-md px-3 py-2 tracking-widest h-36" value={note.toString()} />
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}
