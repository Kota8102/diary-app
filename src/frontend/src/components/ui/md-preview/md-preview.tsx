import createDOMPurify from 'dompurify'
import { parse } from 'marked'

const DOMPurify = createDOMPurify(window)

export type MDPreviewProps = {
  value: string
}

export const MDPreview = ({ value = '' }: MDPreviewProps) => {
  return (
    <div
      className="prose prose-slate absolute inset-0 p-4 overflow-y-auto bg-white rounded-lg"
      ref={(node) => {
        if (node) {
          node.innerHTML = DOMPurify.sanitize(parse(value) as string)
        }
      }}
    />
  )
}
