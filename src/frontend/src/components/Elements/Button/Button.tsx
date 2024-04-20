import { useNavigate } from 'react-router-dom'

type ButtonProps = {
  text: string
  path?: string
}

export const Button = ({ text, path }: ButtonProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (path) {
      navigate(path)
    }
  }

  return (
    <div className="primaryButton rounded-lg">
      <button onClick={handleClick}>{text}</button>
    </div>
  )
}
