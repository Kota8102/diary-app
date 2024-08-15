import { Auth } from 'aws-amplify'

// amplifyのAuthを使ってJWTトークンを取得する関数
export const getJwtToken = async () => {
  const user = await Auth.currentAuthenticatedUser()
  if (!user) {
    return null
  }

  return (await Auth.currentSession()).getIdToken().getJwtToken()
}
