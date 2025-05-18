import { Button } from '@/components/ui/button/button'
import { paths } from '@/config/paths'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type DisplayBouquetProps = {
  image: string
}

export const DisplayBouquet = ({ image }: DisplayBouquetProps) => {
  const navigate = useNavigate()
  const [hasError, setHasError] = useState(false)

  const handleClick = () => {
    navigate(paths.app.bouquetDisplay.getHref())
  }

  useEffect(() => {
    if (!image || image.trim() === '') {
      setHasError(true)
    }
  }, [image])

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full pb-14">
        <div className="text-center text-xl text-red-500 font-medium pb-8">画像が存在しないか、読み込みに失敗しました。</div>
        <Button onClick={() => navigate(-1)}>戻る</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full pb-14">
      <div className="flex flex-col items-center justify-center flex-grow">
        <img
          src={`data:image/jpeg;base64,${image}`}
          alt="Bouquet"
          style={{ maxWidth: '100%', height: 'auto' }}
          onError={(e) => {
            console.error('画像の読み込みに失敗しました')
            e.currentTarget.style.display = 'none'
            setHasError(true)
          }}
        />
      </div>
      <div className="w-full mt-auto">
        <div className="text-center text-xl text-light-textDefault font-medium pb-16">花束が生成されました！</div>
        <Button onClick={handleClick}>花束をみる</Button>
      </div>
    </div>
  )
}
