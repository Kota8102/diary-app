type FlowerImageProps = {
  image: string | undefined
}

export const FlowerImage = ({ image }: FlowerImageProps) => {
  return (
    <div className="flex flex-col mb-4">
      <div className="flex justify-center items-center h-64 w-full">
        <div className="h-64 w-64 flex items-center justify-center rounded-md overflow-hidden">
          {image ? (
            <img src={`data:image/jpeg;base64,${image}`} alt="Flower" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-xs text-light-textPaleBg">日記を作成して花を作成しよう</div>
          )}
        </div>
      </div>
    </div>
  )
}
