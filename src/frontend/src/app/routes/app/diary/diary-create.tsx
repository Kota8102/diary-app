import { ContentLayout } from '@/components/layout/'
import { DiaryCreate } from '@/features/diary/componets/diary-create'

export const DiaryCreateRoute = () => {
  return (
    <ContentLayout pagetitle="Diary">
      <DiaryCreate />
    </ContentLayout>
  )
}
