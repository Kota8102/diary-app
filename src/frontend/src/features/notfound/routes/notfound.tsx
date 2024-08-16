import { Link } from 'react-router-dom'

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">404 Not Found</h1>
      <p className="mb-2">お探しのページは見つかりませんでした。</p>
      <Link to="/diary" className="text-blue-600 hover:underline">
        日記ページへ戻る
      </Link>
    </div>
  )
}
