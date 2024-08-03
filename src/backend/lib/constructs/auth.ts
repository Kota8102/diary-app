import * as cdk from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'

interface AuthProps {
  cognitoDomain?: string;
   googleAuthKey?: string;
   googleAuthSecretKey?: string;
}

export class Auth extends Construct {
  public readonly userPool: cognito.UserPool
  public readonly userPoolClient: cognito.UserPoolClient
  public readonly identityPool: cognito.CfnIdentityPool

  constructor(scope: Construct, id: string, props?: AuthProps) {
    super(scope, id)

    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'app-user-pool',
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      userVerification: {
        emailSubject: 'Verify your email for our app!',
        emailBody: 'Thanks for signing up! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      signInAliases: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
    })

    // Cognitoドメインの追加（prodの場合のみ）
    if (props?.cognitoDomain) {
      userPool.addDomain('CognitoDomain', {
        cognitoDomain: {
          domainPrefix: props.cognitoDomain,
        },
      });
    }

     // Google認証プロバイダーの追加
    if (props?.googleAuthKey && props?.googleAuthSecretKey) {
      const provider = new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
        userPool: userPool,
        clientId: props.googleAuthKey,
        clientSecret: props.googleAuthSecretKey,
        scopes: ['profile', 'email', 'openid'],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
          familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
          profilePicture: cognito.ProviderAttribute.GOOGLE_PICTURE,
        },
      });

      userPool.registerIdentityProvider(provider);
    }

    const userPoolClient = new cognito.UserPoolClient(this, 'DiaryUserPoolClient', {
      userPool,
      userPoolClientName: 'diary-userpool-client',
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
      oAuth: {
        callbackUrls: [''], // 必要に応じて変更してください
        logoutUrls: ['https://bouquet-note.com/auth'], // 必要に応じて変更してください
      },
    })

    this.userPool = userPool
    this.userPoolClient = userPoolClient
  }
}