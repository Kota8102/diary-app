// 必要なライブラリのインポート
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/utils/cn'

// Spinnerコンポーネントは現在未使用
// import { Spinner } from '../spinner'

// ボタンのスタイルバリエーションを定義
const buttonVariants = cva(
  // ベースとなるスタイル
  'rounded-full',
  // 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      // ボタンの種類によるバリエーション
      variant: {
        default: 'bg-light-buttonPrimaryDefault hover:bg-light-buttonPrimaryHover disabled:bg-light-buttonPrimaryDisabled',
        // destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        // outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-buttonSecondaryDefault hover:bg-buttonSecondaryHover disabled:bg-buttonSecondaryDisabled',
        // ghost: 'hover:bg-accent hover:text-accent-foreground',
        // link: 'text-primary underline-offset-4 hover:underline',
      },
      // ボタンのサイズバリエーション
      size: {
        default: 'h-10 px-4 py-2 text-base',
        // sm: 'h-8 rounded-md px-3 text-xs',
        // lg: 'h-10 rounded-md px-8',
        // icon: 'size-9',
      },
    },
    // デフォルトのバリエーション設定
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

// ボタンコンポーネントのProps型定義
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean // 子要素としてレンダリングするかどうか
    isLoading?: boolean // ローディング状態
    icon?: React.ReactNode // アイコン要素
  }

// Buttonコンポーネントの実装
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, isLoading, icon, ...props }, ref) => {
    // asChildがtrueの場合はSlotを、falseの場合はbuttonを使用
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {/* ローディング表示は現在未実装 */}
        {/* {isLoading && <Spinner size="sm" className="text-current" />} */}
        {/* アイコンの表示（ローディング中は非表示） */}
        {!isLoading && icon && <span className="mr-2">{icon}</span>}
        {/* ボタンのコンテンツ */}
        <span className="py-2.5 px-4">{children}</span>
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
