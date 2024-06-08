type PagetitleProps = {
  title: string
}

export const PageTitle = ({ title }: PagetitleProps) => {
  return <h1 className="text-2xl">{title}</h1>
}
