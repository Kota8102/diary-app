type FlowerNoteProps = {
  body: string
}

export const FlowerNote = ({ body }: FlowerNoteProps) => {
  return (
    <div className="flex flex-col flex-grow min-h-0">
      <div className="text-sm font-medium leading-none mb-1">Note</div>
      <div className="flex flex-grow min-h-20 w-full rounded-md pt-6 pl-4 pr-8 overflow-auto bg-light-bgText text-xs">
        <div className="whitespace-pre-wrap">{body}</div>
      </div>
    </div>
  )
}
