import { ChevronLeft, ChevronRight } from 'lucide-react'

export type ImageDisplayProps = {
  src: string
  onPrevious?: () => void
  onNext?: () => void
  showNavigation?: boolean
}

export const ImageDisplay = ({ src, onPrevious, onNext }: ImageDisplayProps) => {
  const imageUrl = `data:image/png;base64,${src}`

  return (
    <div className="flex h-full">
      <div className="relative flex items-center justify-center w-full">
        <button
          type="button"
          onClick={onPrevious}
          className="p-2 rounded-full bg-white/80 hover:bg-white/90 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="w-full h-40 flex justify-center items-center">
          <img src={imageUrl} alt="display" className="max-w-full max-h-full w-auto h-auto object-contain" />
        </div>

        <button type="button" onClick={onNext} className="p-2 rounded-full bg-white/80 hover:bg-white/90 transition-colors" aria-label="Next image">
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  )
}

export default ImageDisplay
