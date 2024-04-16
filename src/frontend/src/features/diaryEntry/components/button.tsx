import { useNavigate } from 'react-router-dom'

type ButtonProps = {
  text: string
  path: string
  backgroundColor: string
}

export const Button = ({ text, path, backgroundColor }: ButtonProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (path) {
      navigate(path)
    }
  }

  return (
    <button
      className="rounded-full w-52 h-52 text-white"
      onClick={handleClick}
      style={{ backgroundColor }}>
      {text}
    </button>
  )
}
