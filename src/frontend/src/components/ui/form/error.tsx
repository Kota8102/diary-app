export type ErrorProps = {
  // エラーメッセージ文字列（オプショナル、nullも許容）
  errorMessage?: string | null
}

export const ErrorMessage = ({ errorMessage }: ErrorProps) => {
  // エラーメッセージが存在しない場合は何も表示しない
  if (!errorMessage) return null

  // エラーメッセージを赤色で表示
  return (
    <div role="alert" aria-label={errorMessage} className="text-sm font-semibold text-red-500">
      {errorMessage}
    </div>
  )
}
