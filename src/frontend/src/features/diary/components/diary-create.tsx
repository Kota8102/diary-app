import { Button } from '@/components/ui/button/button'
import { Form } from '@/components/ui/form/form'
import { Textarea } from '@/components/ui/form/textarea'
import { paths } from '@/config/paths'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import { useNavigate, useParams } from 'react-router-dom'
import { type CreateDiaryInput, createDiaryInputSchema, useCreateDiary } from '../api/create-diary'
import { useGetDiary } from '../api/get-diary'
import 'react-datepicker/dist/react-datepicker.css'

export const DiaryCreate = () => {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const initialDate = date ? new Date(date) : new Date()
  const [startDate, setStartDate] = useState(initialDate)
  const [content, setContent] = useState('')

  // API: 日記の取得
  const { data: diary, isLoading: isLoadingDiary } = useGetDiary({ date: startDate.toISOString().split('T')[0] })

  // 日記データが取得できたら内容を設定
  useEffect(() => {
    console.log('取得した日記データ:', diary)
    if (diary?.content) {
      setContent(diary.content)
    } else {
      setContent('')
    }
  }, [diary])

  // API: 日記の作成
  const createDiaryMutation = useCreateDiary({
    onSuccess: (data) => {
      if (data.flower_image) {
        navigate(paths.app.diaryFlower.getHref(date ?? ''), { state: { image: data.flower_image } })
      }
    },
    onError: (error) => {
      console.error('日記の作成に失敗しました:', error)
    },
  })

  // 日付の変更
  const handleDateChange = (date: Date | null) => {
    setStartDate(date ?? new Date())
    if (date) {
      setStartDate(date)
      navigate(`/app/diary/${date.toISOString().split('T')[0]}`)
    }
  }

  // 日記の作成
  const handleSubmit = (values: CreateDiaryInput) => {
    const submitData = {
      data: {
        date: startDate.toISOString().split('T')[0],
        content: values.content,
      },
    }
    createDiaryMutation.mutate(submitData)
  }

  return (
    <Form<typeof createDiaryInputSchema>
      id="diary-create"
      onSubmit={(values) => {
        handleSubmit({
          date: startDate.toISOString().split('T')[0],
          content: values.content,
        })
      }}
      schema={createDiaryInputSchema}
      className="h-full"
      options={{
        defaultValues: {
          date: startDate.toISOString().split('T')[0],
          content: content,
        },
        values: {
          date: startDate.toISOString().split('T')[0],
          content: content,
        },
      }}
    >
      {({ register, formState }) => {
        return (
          <div className="flex flex-col h-full pt-6 gap-6">
            <DatePicker
              className="flex-none w-full bg-light-bgText rounded-md px-4 py-1 text-light-textDefault focus:outline-none focus:ring-1 focus:ring-black"
              dateFormat="yyyy / MM / dd"
              selected={startDate}
              onChange={handleDateChange}
            />
            <div className="flex-1">
              {isLoadingDiary ? (
                <div className="flex items-center justify-center h-full">
                  <p>日記を読み込み中...</p>
                </div>
              ) : (
                <Textarea
                  registration={register('content', {
                    required: '内容を入力してください',
                  })}
                  placeholder="日記の内容を入力してください"
                  className="flex-1 h-full text-light-textDefault"
                />
              )}
              {formState.errors.content && <p className="text-red-500">{formState.errors.content.message}</p>}
            </div>

            <div className="flex-none">
              <Button form="diary-create" type="submit" isLoading={createDiaryMutation.isPending}>
                生成する
              </Button>
            </div>
          </div>
        )
      }}
    </Form>
  )
}
