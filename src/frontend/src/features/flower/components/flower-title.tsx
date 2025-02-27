type FlowerTitleProps = {
  title: string | undefined
}

export const FlowerTitle = ({ title }: FlowerTitleProps) => {
  return (
    <div className="mb-4">
      <div className="text-sm font-medium leading-none mb-1">Title</div>
      <div className="flex w-full rounded-md h-8 bg-light-bgText pl-4 py-1.5 text-light-textDefault disabled:cursor-not-allowed disabled:opacity-50 overflow-x-auto whitespace-nowrap">
        {title || ''}
      </div>
    </div>
  )
}
