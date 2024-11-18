import * as React from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { cn } from '@/utils/cn'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './field-wrapper'

// 入力フィールドのプロパティ型定義
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  FieldWrapperPassThroughProps & {
    className?: string // カスタムクラス名（オプショナル）
    registration: Partial<UseFormRegisterReturn> // フォーム登録情報
  }

// 入力フィールドコンポーネント
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, error, registration, ...props }, ref) => {
  return (
    <FieldWrapper label={label} error={error}>
      <input
        type={type}
        className={cn(
          // shadcn/uiのデフォルトスタイル（現在は未使用）
          'flex w-full rounded-md h-8 bg-light-bgText pl-4 py-1.5 text-light-textDefault',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'placeholder:text-light-textPaleBg',
          'focus:outline-none focus:ring-1 focus:ring-black',
          className,
        )}
        ref={ref}
        {...registration}
        {...props}
      />
    </FieldWrapper>
  )
})
// コンポーネント名の設定（開発ツールでの表示用）
Input.displayName = 'Input'

export { Input }
