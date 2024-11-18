import { cn } from '@/utils/cn'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

// チェックボックスのラッパーのスタイル
const wrapperVariants = cva(
  'flex items-center gap-2', // 基本的な横並びのレイアウト
  {
    variants: {
      size: {
        default: '', // サイズによる余白の調整が必要な場合に使用
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

// チェックボックス自体のスタイル
const checkboxVariants = cva(
  [
    'appearance-none',
    'block',
    'rounded',
    'bg-light-checkboxBg',
    'ring-1',
    'ring-light-checkboxRing',
    'border-[3px]',
    'border-white',
    'relative',
    'cursor-pointer',
    'transition-all',
    'checked:bg-primary',
    'checked:content-["✓"]',
    'checked:text-white',
    'checked:flex',
    'checked:items-center',
    'checked:justify-center',
    'checked:after:content-["✓"]',
    'checked:after:text-white',
    'checked:after:text-sm',
  ].join(' '),
  {
    variants: {
      size: {
        default: 'w-6 h-6', // デフォルトサイズ
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

// ラベルのスタイル
const labelVariants = cva(
  [
    'select-none', // テキスト選択を無効化
    'text-gray-700', // テキストの色
  ].join(' '),
  {
    variants: {
      size: {
        default: 'text-base', // デフォルトのテキストサイズ
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

// Propsの型定義
export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof checkboxVariants> & {
    label?: React.ReactNode
    asChild?: boolean
  }

// チェックボックスコンポーネント
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, size, label, asChild = false, id, disabled, ...props }, ref) => {
  // ユニークなIDの生成
  const checkboxId = id || React.useId()

  return (
    <div className={cn(wrapperVariants({ size }), className)}>
      <input type="checkbox" id={checkboxId} ref={ref} disabled={disabled} className={cn(checkboxVariants({ size }))} {...props} />
      {label && (
        <label htmlFor={checkboxId} className={cn(labelVariants({ size }), disabled && 'opacity-50 cursor-not-allowed')}>
          {label}
        </label>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

export { Checkbox, checkboxVariants, labelVariants }
