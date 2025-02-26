import { ContentLayout } from '@/components/layout'
import { Flower } from '@/features/flower/components/flower'

export const FlowerRoute = () => {
  return (
    <ContentLayout pagetitle={'Diary'} showTab={true}>
      <Flower />
    </ContentLayout>
  )
}
