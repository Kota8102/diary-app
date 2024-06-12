import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import moment from 'moment'
import Datetime from 'react-datetime'

import { ContentLayout } from '../../../components/layout/ContentLayout'
import { DisabledButton } from '../../../components/Elements/Button'

import '../styles/react-datetime.css'

export const WriteDiaryInput = () => {
  const { date } = useParams()
  const navigate = useNavigate()

  const [diary, setDiary] = useState('')

  // yyyy--mm-dd以外の日付が入力された場合、トップページにリダイレクト
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
          value={diary}
          onChange={(e) => setDiary(e.target.value)}
        />
        <DisabledButton
          text="生成する"
          onClick={() => {}}
          css=""
          disabled={diary.trim() === ''}
          enabledCss="bg-light-buttonPrimaryDefault hover:bg-light-buttonPrimaryHover"
          disabledCss="bg-light-buttonPrimaryDisabled"
        />
      </div>
    </ContentLayout>
  )
}
