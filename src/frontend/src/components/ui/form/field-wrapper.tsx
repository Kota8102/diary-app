import type * as React from 'react'
import type { FieldError } from 'react-hook-form'

import { ErrorMessage } from './error'
import { Label } from './label'

// フォームフィールドのラッパーコンポーネントのプロパティ定義
type FieldWrapperProps = {
  label?: string // ラベルテキスト（オプショナル）
  className?: string // カスタムクラス名（オプショナル）
  children: React.ReactNode // 子要素
  error?: FieldError | undefined // バリデーションエラー（オプショナル）
}

// 他のコンポーネントに渡すプロパティ型から className と children を除外
export type FieldWrapperPassThroughProps = Omit<FieldWrapperProps, 'className' | 'children'>

// フォームフィールドをラップするコンポーネント
export const FieldWrapper = (props: FieldWrapperProps) => {
  const { label, error, children } = props
  return (
    <div>
      <Label>
        {label}
        {/* 子要素のコンテナ */}
        <div className="mt-1">{children}</div>
      </Label>
      {/* エラーメッセージの表示 */}
      <ErrorMessage errorMessage={error?.message} />
    </div>
  )
}
