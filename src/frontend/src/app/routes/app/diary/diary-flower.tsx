import { ContentLayout } from '@/components/layout'
import { DisplayFlower } from '@/features/diary/componets/display-flower'
import { useLocation } from 'react-router-dom'

export const DiaryFlower = () => {
  // 日記作成ページから画像を受け取る
  const location = useLocation()
  const image = location.state?.image

  return (
    <ContentLayout pagetitle={''} showTab={false}>
      <DisplayFlower image={image} />
    </ContentLayout>
  )
}
