import { ContentLayout } from '../../../components/layout'

export const Setting = () => {
  return (
    <ContentLayout pagetitle="設定設定">
      <div className="flex flex-col w-full divide-y divide-gray-400">
        <a
          href="#"
          className="block p-4 w-full">
          バックアップ
        </a>
        <a
          href="#"
          className="block p-4 w-full">
          ダークモード
        </a>
        <a
          href="#"
          className="block p-4 w-full">
          パスワードの変更
        </a>
        <a
          href="#"
          className="block p-4 w-full">
          通知設定
        </a>
        <div className="border-t border-gray-400" />
      </div>
    </ContentLayout>
  )
}
