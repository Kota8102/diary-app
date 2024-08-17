import moment from 'moment'
import { useEffect, useState } from 'react'
import Datetime from 'react-datetime'
import { useNavigate, useParams } from 'react-router-dom'

import { DisabledButton } from '../../../components/Elements/Button'
import { ContentLayout } from '../../../components/layout/ContentLayout'
import { useCreateDiary } from '../api/create-diary'

import '../styles/react-datetime.css'

export const WriteDiaryInput = () => {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()

  const [diary, setDiary] = useState('')
  const [currentDate, setCurrentDate] = useState(date || moment().format('YYYY-MM-DD'))

  const createDiaryMutation = useCreateDiary()

  // yyyy-mm-dd以外の日付が入力された場合、トップページにリダイレクト
  useEffect(() => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(currentDate)) {
      navigate('/')
    }
  }, [currentDate, navigate])

  const handleDateChange = (newDate: moment.Moment | string) => {
    const formattedDate = moment(newDate).format('YYYY-MM-DD')
    setCurrentDate(formattedDate)
    navigate(`/diary/${formattedDate}`)
  }

  const handleSubmit = () => {
    createDiaryMutation.mutate(
      { date: currentDate, content: diary },
      {
        onSuccess: () => {
          alert('日記が正常に作成されました。')
          setDiary('') // 入力フィールドをクリア
        },
        onError: (error) => {
          console.error('日記の作成に失敗しました:', error)
          alert('日記の作成に失敗しました。もう一度お試しください。')
        },
      },
    )
  }

  return (
    <ContentLayout pagetitle="Diary">
      <div className="flex flex-col w-full h-full gap-5">
        <Datetime value={moment(currentDate, 'YYYY-MM-DD')} dateFormat={'YYYY / MM / DD'} timeFormat={false} onChange={handleDateChange} />
        <textarea
          className="flex-grow w-full p-4 rounded-md bg-light-bgText resize-none"
          placeholder="ここに日記を入力してください。"
          value={diary}
          onChange={(e) => setDiary(e.target.value)}
        />
        <DisabledButton
          text={createDiaryMutation.isPending ? '生成中...' : '生成する'}
          onClick={handleSubmit}
          css=""
          disabled={diary.trim() === '' || createDiaryMutation.isPending}
          enabledCss="bg-light-buttonPrimaryDefault hover:bg-light-buttonPrimaryHover"
          disabledCss="bg-light-buttonPrimaryDisabled"
        />
      </div>
    </ContentLayout>
  )
}
