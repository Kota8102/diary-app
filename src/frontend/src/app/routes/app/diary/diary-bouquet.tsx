import { ContentLayout } from '@/components/layout'
import { DisplayBouquet } from '@/features/diary/components/display-bouquet'
import { useLocation } from 'react-router-dom'

export const DisplayBouquetRoute = () => {
  // 花束作成ページから画像を受け取る
  const location = useLocation()
  const image = location.state?.image

  return (
    <ContentLayout pagetitle={''} showTab={false}>
      <DisplayBouquet image={image} />
    </ContentLayout>
  )
}
