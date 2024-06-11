import { MouseEventHandler } from 'react'

type ButtonProps = {
  text: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  css?: string
}

export const Button = ({ text, onClick, css = 'bg-light-buttonPrimaryDefault' }: ButtonProps) => {
  return (
    <div className={`rounded-lg ${css} p-3 w-full text-center text-base`}>
      <button
        className={`rounded-lg`}
        onClick={onClick}>
        {text}
      </button>
    </div>
  )
}
