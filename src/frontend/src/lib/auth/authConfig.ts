import { Amplify } from 'aws-amplify'

const AwsConfig = {
  region: import.meta.env.VITE_COGNITO_REGION,
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_COGNITO_APP_USER_POOL_CLIENT_ID,
  authenticationFlowType: 'USER_SRP_AUTH',
}

export const configureAuth = () => {
  Amplify.configure(AwsConfig)
}
