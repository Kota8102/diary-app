import { useNavigate } from 'react-router-dom'

type ButtonProps = {
  text: string
  path: string
}

export const Button = ({ text, path }: ButtonProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (path) {
      navigate(path)
    }
  }

  return (
    <button
      className="w-full bg-light-buttonPrimaryDefault p-2 text-base font-normal rounded-lg text-black hover:bg-light-buttonPrimaryHover"
      onClick={handleClick}
    >
      {text}
    </button>
  )
}

type SendButtonProps = {
  text: string
  onClick: () => void
}

export const SendButton = ({ text, onClick }: SendButtonProps) => {
  return (
    <button
      className="w-full bg-light-buttonPrimaryDefault p-2 text-base font-normal rounded-lg text-black hover:bg-light-buttonPrimaryHover"
      onClick={onClick}
    >
      {text}
    </button>
  )
}
