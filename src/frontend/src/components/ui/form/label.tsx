import * as LabelPrimitive from '@radix-ui/react-label'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/utils/cn'

// ラベルのバリエーション
const labelVariants = cva('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70')

// Labelコンポーネントの定義
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(
  // LabelPrimitive.Rootを基にしたLabelコンポーネントを作成
  ({ className, ...props }, ref) => <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />,
)

// Labelコンポーネントの表示名を設定
Label.displayName = LabelPrimitive.Root.displayName

// Labelコンポーネントをエクスポート
export { Label }
