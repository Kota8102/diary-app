import { useSearchParams } from 'react-router-dom'

import { TextArea } from '../../../components/Elements/TextArea'

export const DiaryInput = () => {
  const [searchParams] = useSearchParams()
  const date = searchParams.get('date')

  return (
    <div className="flex flex-col h-screen">
      <div className="pt-8 pb-4 px-4">
        <h1 className="text-lg text-left p-3">日記を入力</h1>
        <p className="text-left p-3 text-3xl">{date}</p>
      </div>
      <div className="flex-grow px-4">
        <TextArea />
      </div>
      <div className="p-4">
        <button className="w-full bg-gray-200 p-4 rounded-lg shadow text-gray-700 font-semibold">
          完了
        </button>
      </div>
    </div>
  )
}
