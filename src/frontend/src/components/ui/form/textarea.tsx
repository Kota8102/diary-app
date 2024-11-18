// components/ui/form/textarea.tsx
import * as React from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

import { cn } from '@/utils/cn'

import { TextareaWrapper } from './textarea-wrapper'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  className?: string
  error?: FieldError | undefined
  registration: Partial<UseFormRegisterReturn>
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, error, registration, ...props }, ref) => {
  return (
    <TextareaWrapper label={label} error={error}>
      <textarea
        className={cn(
          'flex min-h-20 w-full rounded-md pt-6 pl-4 pr-8',
          'bg-light-bgText text-xs',
          'focus:outline-none focus:ring-1 focus:ring-black',
          className,
        )}
        ref={ref}
        {...registration}
        {...props}
      />
    </TextareaWrapper>
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
