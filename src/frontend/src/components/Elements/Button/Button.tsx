import { MouseEventHandler } from 'react'

type ButtonProps = {
  text: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  css?: string
}

export const Button = ({ text, onClick, css = 'bg-light-buttonPrimaryDefault' }: ButtonProps) => {
  return (
    <button
      className={`rounded-lg ${css} p-3 w-full text-center text-base`}
      onClick={onClick}>
      {text}
    </button>
  )
}

type DisabledButtonProps = {
  text: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  css?: string
  disabled?: boolean
  enabledCss?: string
  disabledCss?: string
}

export const DisabledButton = ({
  text,
  onClick,
  css = '',
  disabled = false,
  enabledCss = 'bg-light-buttonPrimaryDefault hover:bg-light-buttonPrimaryHover',
  disabledCss = 'bg-light-buttonPrimaryDisabled',
}: DisabledButtonProps) => {
  return (
    <button
      className={`rounded-lg ${css} p-3 w-full text-center text-base ${
        disabled ? disabledCss : enabledCss
      }`}
      onClick={onClick}
      disabled={disabled}>
      {text}
    </button>
  )
}
