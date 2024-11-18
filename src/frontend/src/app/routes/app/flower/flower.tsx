import { ContentLayout } from '@/components/layout'
import { FlowerDiary } from '@/features/flower/components/flower-diary'

export const FlowerRoute = () => {
  return (
    <ContentLayout pagetitle="Diary" showHeaderIcon={true}>
      <FlowerDiary />
    </ContentLayout>
  )
}
