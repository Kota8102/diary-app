import createDOMPurify from 'dompurify'
import { marked } from 'marked'

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
          // parseの代わりにmarked.parseを使用し、型エラーを解消
          const content = marked.parse(value)
          node.innerHTML = DOMPurify.sanitize(content)
        }
      }}
    />
  )
}
