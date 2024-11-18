import type * as React from 'react'
import type { FieldError } from 'react-hook-form'

import { ErrorMessage } from './error'
import { Label } from './label'

type TextareaWrapperProps = {
  label?: string
  className?: string
  children: React.ReactNode
  error?: FieldError | undefined
}

export const TextareaWrapper = (props: TextareaWrapperProps) => {
  // プロパティからlabel, error, childrenを抽出
  const { label, error, children } = props
  return (
    <div className="h-full">
      {/* ラベルコンポーネント */}
      <Label className="h-full">
        {label}
        {/* 子要素のコンテナ */}
        <div className="mt-1 h-full">{children}</div>
      </Label>
      {/* エラーメッセージの表示 */}
      <ErrorMessage errorMessage={error?.message} />
    </div>
  )
}
