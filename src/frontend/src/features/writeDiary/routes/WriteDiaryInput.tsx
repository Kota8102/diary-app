import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import moment from 'moment'
import Datetime from 'react-datetime'

import { DisabledButton } from '../../../components/Elements/Button'
import { ContentLayout } from '../../../components/layout/ContentLayout'
import { createDiary, CreateDiaryInput } from '../api/create-diary'

import '../styles/react-datetime.css'

export const WriteDiaryInput = () => {
  const { date } = useParams()
  const navigate = useNavigate()
  const [diaryContent, setDiaryContent] = useState('')

  useEffect(() => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(date ?? '')) {
      navigate('/')
    }
  }, [date, navigate])

  const handleDateChange = (newDate: moment.Moment | string) => {
    const formattedDate = moment(newDate).format('YYYY-MM-DD')
    navigate(`/diary/${formattedDate}`)
  }

  const handleSubmit = () => {
    if (!date) {
      console.error('Date is undefined')

      return
    }

    const data: CreateDiaryInput = { date, content: diaryContent }
    createDiary({ data })
      .then((response) => {
        if (response.statusCode !== 200) {
          console.error('Error:', response.body)
        }
      })
      .catch((err) => {
        console.error('An error occurred while creating the diary.', err)
      })
  }

  return (
    <ContentLayout pagetitle="Diary">
      <div className="flex flex-col w-full h-full gap-5">
        <Datetime
          initialValue={moment(date, 'YYYY-MM-DD')}
          dateFormat={'YYYY / MM / DD'}
          timeFormat={false}
          onChange={handleDateChange}
        />
        <textarea
          className="flex-grow w-full p-4 rounded-md bg-light-bgText resize-none"
          placeholder="ここに日記を入力してください。"
          value={diaryContent}
          onChange={(e) => setDiaryContent(e.target.value)}
        />
        <DisabledButton
          text="生成する"
          onClick={handleSubmit}
          css=""
          disabled={diaryContent.trim() === ''}
          enabledCss="bg-light-buttonPrimaryDefault hover:bg-light-buttonPrimaryHover"
          disabledCss="bg-light-buttonPrimaryDisabled"
        />
      </div>
    </ContentLayout>
  )
}
