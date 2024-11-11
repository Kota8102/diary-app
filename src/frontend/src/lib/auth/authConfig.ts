import { Amplify } from 'aws-amplify'

// Amazon Cognitoの設定オブジェクト
const AwsConfig = {
  // Cognitoのリージョン
  region: import.meta.env.VITE_COGNITO_REGION,
  // ユーザープールID
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  // アプリクライアントID
  userPoolWebClientId: import.meta.env.VITE_COGNITO_APP_USER_POOL_CLIENT_ID,
  // 認証フロータイプ (SRP: Secure Remote Password プロトコル)
  authenticationFlowType: 'USER_SRP_AUTH',
}

/**
 * Amplifyの設定を行う関数
 * アプリケーション起動時に呼び出される
 */
export const configureAuth = () => {
  Amplify.configure(AwsConfig)
}
