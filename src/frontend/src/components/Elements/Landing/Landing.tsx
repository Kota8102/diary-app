import type React from 'react'

import logo from '@/assets/logo.svg'

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <img src={logo} alt="Logo" className="w-32 h-32" />
    </div>
  )
}

export default Landing
