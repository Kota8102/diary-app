import { createContext, useState, useEffect, ReactNode } from 'react'

import { User, getCurrentUser, signIn, signOut } from '@utils/auth'

type AuthContextProps = {
  user: User | null
  isLoading: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<Partial<AuthContextProps>>({})

type AuthProviderProps = {
  children: ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGetCurrentUser = async () => {
    await getCurrentUser()
      .then((user) => {
        setUser(user)
      })
      .catch(() => setUser(null))
  }

  useEffect(() => {
    const helper = async () => {
      setIsLoading(true)
      await handleGetCurrentUser()
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false))
    }
    helper()
  }, [])

  const handleSignIn = async (username: string, password: string) => {
    await signIn(username, password)
    await handleGetCurrentUser()
  }

  const handleSignOut = async () => {
    signOut()
    setUser(null)
  }

  const authValue = {
    user,
    isLoading,
    signIn: handleSignIn,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
}

export { AuthProvider, AuthContext }
