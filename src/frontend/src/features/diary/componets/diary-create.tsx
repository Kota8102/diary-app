import { Button } from '@/components/ui/button/button'
import { Form } from '@/components/ui/form/form'
import { Textarea } from '@/components/ui/form/textarea'
import { paths } from '@/config/paths'
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import { useNavigate, useParams } from 'react-router-dom'
import { type CreateDiaryInput, createDiaryInputSchema, useCreateDiary } from '../api/create-diary'
import 'react-datepicker/dist/react-datepicker.css'

export const DiaryCreate = () => {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const initialDate = date ? new Date(date) : new Date()
  const [startDate, setStartDate] = useState(initialDate)

  const createDiaryMutation = useCreateDiary({
    onSuccess: (data) => {
      navigate(paths.app.diaryFlower.getHref(date ?? ''), { state: { image: data.flower_image } })
    },
    onError: (error) => {
      console.error('日記の作成に失敗しました:', error)
    },
  })

  const handleDateChange = (date: Date | null) => {
    setStartDate(date ?? new Date())
    navigate(`/app/diary/${date?.toISOString().split('T')[0]}`)
  }

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
          content: '',
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
              <Textarea
                registration={register('content', {
                  required: '内容を入力してください',
                })}
                placeholder="日記の内容を入力してください"
                className="flex-1 h-full text-light-textDefault"
              />
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
