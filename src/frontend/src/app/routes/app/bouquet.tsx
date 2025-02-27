import { ContentLayout } from '@/components/layout'
import { Bouquet } from '@/features/bouquet/components/bouquet'

export const BouquetRoute = () => {
  return (
    <ContentLayout pagetitle="Bouquet" showHeaderIcon={true}>
      <Bouquet />
    </ContentLayout>
  )
}
