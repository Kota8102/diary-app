import { cn } from '@/utils/cn'

import { vase1, vase2, vase3 } from '@/assets/icons'

export const LoadingScreen = () => {
  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-background')}>
      <div className="relative flex items-end gap-4" role="status" aria-label="読み込み中">
        {[vase1, vase2, vase3].map((src, index) => (
          <div key={src} className="flex flex-col items-center">
            <img
              src={src}
              alt=""
              className={cn(
                'h-16 w-auto animate-bounce',
                index === 0 && 'animate-delay-0',
                index === 1 && 'animate-delay-200',
                index === 2 && 'animate-delay-400',
              )}
              style={{ animationDuration: '1000ms' }}
            />
            <div className={cn('mt-2 h-1 w-8 rounded-full bg-primary/20')} />
          </div>
        ))}
        <span className="sr-only">読み込み中...</span>
      </div>
    </div>
  )
}
