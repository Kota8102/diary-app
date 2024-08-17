interface InputProps {
  id: string
  label: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const Input = ({ id, label, type, value, onChange }: InputProps) => {
  return (
    <div className="relative">
      <input id={id} type={type} value={value} onChange={onChange} className="w-full bg-light-bgText rounded p-2" placeholder={value ? '' : label} />
    </div>
  )
}
