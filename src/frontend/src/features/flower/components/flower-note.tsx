import { pencil } from '@/assets/icons'

type FlowerNoteProps = {
  body: string
  onEdit?: () => void
}

export const FlowerNote = ({ body, onEdit }: FlowerNoteProps) => {
  return (
    <div className="flex flex-col flex-grow min-h-0 relative">
      <div className="text-sm font-medium leading-none mb-1">Note</div>
      <div className="flex flex-grow min-h-20 w-full rounded-md pt-6 pl-4 pr-8 overflow-auto bg-light-bgText text-xs">
        <div className="whitespace-pre-wrap">{body}</div>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute bottom-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="編集"
        >
          <img src={pencil} alt="編集" className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
