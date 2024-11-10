import logo from '@/assets/logo.svg'

export const LoadingRoute = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <img src={logo} alt="logo" className="w-32 h-32" />
    </div>
  )
}
