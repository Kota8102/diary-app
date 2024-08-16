import { useEffect, useRef, useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { ContentLayout } from '../../../components/layout'

// APIがまだできていないため、暫定的な処理
import { flower1, flower2 } from '../../../example'

export const Flower = () => {
  const [title] = useState<string>('カフェと店員さんとケーキ')
  const [note] = useState<string>(
    '今日はカフェで勉強した。勉強していたら、カフェの店員さんが話しかけてくれて、今頑張っている試験について話した。そしたら、頑張ってるねって言ってケーキをプレゼントしてもらった。嬉しい！めっちゃ美味しかったし、また行こうと思った！',
  )

  const exampleImages = [flower1, flower2]
  const [images] = useState<string[]>(exampleImages)

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centeredSlides: true,
  }

  const noteRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (noteRef.current) {
      noteRef.current.style.height = 'auto'
      noteRef.current.style.height = `${noteRef.current.scrollHeight}px`
    }
  }, [])

  return (
    <ContentLayout pagetitle="Diary">
      <div className="flex flex-col w-full h-full gap-5 justify-between overflow-hidden">
        <p>2024/06/11</p>
        <Slider {...settings}>
          {images.map((image) => (
            <div
              key={image} // ここで画像URLをキーとして使用
              className="flex justify-center items-center h-2/5"
            >
              <img src={image} alt={'Slide'} className="max-w-full max-h-full" />
            </div>
          ))}
        </Slider>
        <div className="flex justify-end">
          <button
            type="button"
            className={'rounded-2xl p-1 text-base bg-light-buttonSecondaryDefault text-white w-2/5'}
            // onClick={onClick}
            disabled={note.trim() === ''}
          >
            Make Bouquet
          </button>
        </div>
        <div className="flex flex-col gap-1 h-2/5 text-xs">
          <div className="flex flex-col gap-1">
            <p>Title</p>
            <p className="bg-light-bgText rounded-md px-3 py-2">{title}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p>Note</p>
            <textarea ref={noteRef} className="bg-light-bgText rounded-md px-3 py-2 tracking-widest" value={note} />
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}
