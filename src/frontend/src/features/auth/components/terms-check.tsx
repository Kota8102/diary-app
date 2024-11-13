import { termsOfService } from '@/assets/termsOfService'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { MDPreview } from '@/components/ui/md-preview'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const TermsCheck = () => {
  // ページ遷移のためのフック
  const navigate = useNavigate()
  // チェックボックスの状態管理
  const [hasAgreed, setHasAgreed] = useState(false)

  // チェックボックスの状態を切り替える
  const handleAgreementChange = () => {
    setHasAgreed(!hasAgreed)
  }

  // 同意確認ボタンクリック時の処理
  const handleAgreementSubmit = () => {
    navigate('/auth/register')
  }
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex flex-col flex-1 pt-4">
          {/* Markdown表示エリア */}
          <div className="flex-1 min-h-0 relative">
            <MDPreview value={termsOfService} />
          </div>

          {/* 操作エリア */}
          <div className="flex flex-col shrink-0">
            <div className="flex justify-center py-11">
              <Checkbox checked={hasAgreed} onChange={handleAgreementChange} className="justify-center" label="利用規約に同意する" />
            </div>

            <div className="flex justify-center">
              <Button onClick={handleAgreementSubmit} disabled={!hasAgreed}>
                同意して進む
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
