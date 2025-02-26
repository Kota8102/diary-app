type DateDisplayProps = {
  date: Date
}

export const DateDisplay = ({ date }: DateDisplayProps) => {
  // 日付を表示用にフォーマット
  const getMonthStr = (date: Date) => {
    const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
    return months[date.getMonth()]
  }

  const monthStr = getMonthStr(date)
  const dayStr = date.getDate()

  return (
    <div className="flex items-center mb-2">
      <div className="bg-light-bgText rounded-full w-16 h-16 flex items-center justify-center mr-3">
        <span className="text-2xl font-bold text-gray-700">{dayStr}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-medium text-gray-700">{monthStr}</span>
        <span className="text-gray-500">{date.getFullYear()}</span>
      </div>
    </div>
  )
}
