import { AuthLayout } from '@/components/layout'
import { TermsCheck } from '@/features/auth/components/terms-check'

export const TermsRoute: React.FC = () => {
  return (
    <AuthLayout title="同意書">
      <TermsCheck />
    </AuthLayout>
  )
}

// import type React from 'react'
// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'

// import ReactMarkdown from 'react-markdown'

// import { termsOfService } from '@/assets/termsOfService.ts'
// import { DisabledButton } from '@/components/Elements/Button'

// export const TermsRoute: React.FC = () => {
//   const [isChecked, setIsChecked] = useState(false)
//   const navigate = useNavigate()

//   const handleCheckboxChange = () => {
//     setIsChecked(!isChecked)
//   }

//   const handleSubmit = () => {
//     if (isChecked) {
//       navigate('/auth/register')
//     }
//   }

//   return (
//     <div className="flex flex-col h-screen overflow-hidden py-12 px-5 gap-4">
//       <h2 className="text-xl text-center">利用規約</h2>
//       <div className="bg-white p-4 rounded-lg shadow h-full overflow-y-auto">
//         <ReactMarkdown className="prose prose-sm max-w-none">{termsOfService}</ReactMarkdown>
//       </div>
//       <div className="flex items-center justify-center gap-2">
//         <input type="checkbox" id="consent-checkbox" checked={isChecked} onChange={handleCheckboxChange} className="w-4 h-4" />
//         <label htmlFor="consent-checkbox" className="text-sm">
//           利用規約に同意する
//         </label>
//       </div>
//       <DisabledButton text="同意する" onClick={handleSubmit} disabled={!isChecked} />
//     </div>
//   )
// }
