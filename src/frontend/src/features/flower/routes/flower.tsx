import { useEffect, useRef, useState } from 'react'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { ContentLayout } from '@/components/layout'

import { useTitle } from '../api/get-title'
import { useNote } from '../api/get-note'

export const Flower = () => {
  const [date] = useState('2024-08-18')
  const { data: titleData } = useTitle({
    date,
    queryConfig: {},
  })

  const { data: noteData, error: noteError } = useNote({
    date,
    queryConfig: {},
  })

  const [note, setNote] = useState('')
  const noteRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (noteData?.title.content) {
      setNote(noteData.title.content)
    }
  }, [noteData])

  useEffect(() => {
    if (noteRef.current) {
      noteRef.current.style.height = 'auto'
      noteRef.current.style.height = `${noteRef.current.scrollHeight}px`
    }
  }, [])

  // ノートの変更を処理する関数
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
  }

  // エラー処理
  // if (titleError && !(titleError instanceof Error && titleError.message.includes('404'))) {
  //   return <div>Error loading title: {titleError instanceof Error ? titleError.message : 'Unknown error occurred'}</div>
  // }

  if (noteError && !(noteError instanceof Error && noteError.message.includes('404'))) {
    return <div>Error loading note: {noteError instanceof Error ? noteError.message : 'Unknown error occurred'}</div>
  }

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
              {titleData?.title.title || ''} {/* 404の場合は空文字列を表示 */}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p>Note</p>
            <textarea ref={noteRef} className="bg-light-bgText rounded-md px-3 py-2 tracking-widest" value={note} onChange={handleNoteChange} />
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}
