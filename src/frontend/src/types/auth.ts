export interface Result {
  success: boolean
  message: string
  hasChallenge?: boolean
  challengeName?: string
}

export interface UseAuth {
  isLoading: boolean
  isAuthenticated: boolean
  username: string
  currentAuthenticatedUser: () => Promise<unknown>
  signUp: (username: string, password: string) => Promise<Result>
  confirmSignUp: (sername: string, password: string, verificationCode: string) => Promise<Result>
  signIn: (username: string, password: string) => Promise<Result>
  signInComplete: (username: string, oldPassword: string, newPassword: string) => Promise<Result>
  signOut: () => void
  changePassword: (user: unknown, oldPassword: string, newPassword: string, newPasswordConfirm: string) => Promise<Result>
  forgetPassword: (email: string) => Promise<Result>
  resetPassword: (username: string, code: string, newPassword: string, newPasswordConfirm: string) => Promise<Result>
}
