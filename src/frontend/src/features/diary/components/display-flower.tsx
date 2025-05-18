import { Button } from '@/components/ui/button/button'
import { paths } from '@/config/paths'
import { useNavigate, useParams } from 'react-router-dom'

export type DisplayFlowerProps = {
  image: string
}

export const DisplayFlower = ({ image }: DisplayFlowerProps) => {
  const navigate = useNavigate()

  const { date } = useParams<{ date: string }>()

  // 花の表示ページに遷移
  const handleClick = () => {
    navigate(paths.app.flower.getHref(date ?? ''))
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full pb-14">
      <div className="flex flex-col items-center justify-center flex-grow">
        <img
          className=""
          src={image ? `data:image/jpeg;base64,${image}` : ''}
          alt="Flower"
          style={{ maxWidth: '100%', height: 'auto' }}
          onError={(e) => {
            console.error('画像の読み込みに失敗しました')
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      <div className="w-full mt-auto">
        <div className="text-center text-xl text-light-textDefault font-medium pb-16">花が生成されました！</div>
        <Button onClick={handleClick}>表示する</Button>
      </div>
    </div>
  )
}
