// zodResolverをインポートして、ZodスキーマをReact Hook Formで使用するためのリゾルバを提供
import { zodResolver } from '@hookform/resolvers/zod'
// LabelPrimitiveを型としてインポート
import type * as LabelPrimitive from '@radix-ui/react-label'
// Slotコンポーネントをインポート
import { Slot } from '@radix-ui/react-slot'
// Reactをインポート
import * as React from 'react'
// react-hook-formから必要なフックや型をインポート
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
  useForm,
  useFormContext,
} from 'react-hook-form'
// zodから型をインポート
import type { ZodType, z } from 'zod'

// ユーティリティ関数cnをインポート
import { cn } from '@/utils/cn'

// Labelコンポーネントをインポート
import { Label } from './label'

// フォームフィールドのコンテキストの型を定義
type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName
}

// フォームフィールドのコンテキストを作成
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

// フォームフィールドコンポーネントを定義
const FormField = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

// useFormFieldフックを定義
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// フォームアイテムのコンテキストの型を定義
type FormItemContextValue = {
  id: string
}

// フォームアイテムのコンテキストを作成
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

// フォームアイテムコンポーネントを定義
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = 'FormItem'

// フォームラベルコンポーネントを定義
const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(
  ({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField()

    return <Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />
  },
)
FormLabel.displayName = 'FormLabel'

// フォームコントロールコンポーネントを定義
const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = 'FormControl'

// フォーム説明コンポーネントを定義
const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return <p ref={ref} id={formDescriptionId} className={cn('text-[0.8rem] text-muted-foreground', className)} {...props} />
})
FormDescription.displayName = 'FormDescription'

// フォームメッセージコンポーネントを定義
const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p ref={ref} id={formMessageId} className={cn('text-[0.8rem] font-medium text-destructive', className)} {...props}>
      {body}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

// フォームプロパティの型を定義
type FormProps<TFormValues extends FieldValues, Schema> = {
  onSubmit: SubmitHandler<TFormValues>
  schema: Schema
  className?: string
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode
  options?: UseFormProps<TFormValues>
  id?: string
}

// フォームコンポーネントを定義
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const Form = <Schema extends ZodType<any, any, any>, TFormValues extends FieldValues = z.infer<Schema>>({
  onSubmit,
  children,
  className,
  options,
  id,
  schema,
}: FormProps<TFormValues, Schema>) => {
  const form = useForm({ ...options, resolver: zodResolver(schema) })
  return (
    <FormProvider {...form}>
      <form className={cn('space-y-6', className)} onSubmit={form.handleSubmit(onSubmit)} id={id}>
        {children(form)}
      </form>
    </FormProvider>
  )
}

// 各コンポーネントとフックをエクスポート
export { useFormField, Form, FormProvider, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }
