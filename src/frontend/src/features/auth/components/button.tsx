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
      className="w-full bg-light-buttonPrimaryDefault p-4 rounded-lg text-black font-semibold"
      onClick={handleClick}>
      {text}
    </button>
  )
}
