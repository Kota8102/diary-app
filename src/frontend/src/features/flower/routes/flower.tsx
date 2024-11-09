import { useEffect, useState } from 'react'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { ContentLayout } from '@/components/layout'

import { useLocation } from 'react-router-dom'

import { useTitle } from '../api/get-title'
import { DateDisplay } from '../components/DateDisplay'

export const Flower = () => {
  // 日付を取得
  const { pathname } = useLocation()
  const date = pathname.split('/').pop() || ''

  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')

  const { data: titleData } = useTitle({
    date,
    queryConfig: {},
  })

  useEffect(() => {
    console.log(titleData)
    if (titleData?.title !== undefined) {
      setTitle(String(titleData.title) || '')
    }
  }, [titleData])

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
            <p className="bg-light-bgText rounded-md px-3 py-2 h-8">{title || ''}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p>Note</p>
            <textarea className="bg-light-bgText rounded-md px-3 py-2 tracking-widest h-36" value={note} />
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}
