import { useEffect, useState } from 'react'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { ContentLayout } from '@/components/layout'

import { useLocation } from 'react-router-dom'

import { useTitle } from '../api/get-title'

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
        <p>{date}</p>
        <div className="flex justify-end">
          <button
            type="button"
            className={'rounded-2xl p-1 text-base bg-light-buttonSecondaryDefault text-white w-2/5'}
            disabled={note.trim() === ''}
          >
            Make Bouquet
          </button>
        </div>
        <div className="flex flex-col gap-1 h-2/5 text-xs">
          <div className="flex flex-col gap-1">
            <p>Title</p>
            <p className="bg-light-bgText rounded-md px-3 py-2">
              {title || ''} {/* 404の場合は空文字列を表示 */}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p>Note</p>
            {/* <textarea ref={noteRef} className="bg-light-bgText rounded-md px-3 py-2 tracking-widest" value={note} onChange={handleNoteChange} /> */}
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}
