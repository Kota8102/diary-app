import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';

export class AuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
    });

    const userPoolClient = new cognito.UserPoolClient(this, "DiaryUserPoolClient", {
      userPool,
      userPoolClientName: "diary-userpool-client",
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
    });

    const identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: userPoolClient.userPoolClientId,
        providerName: userPool.userPoolProviderName,
      }],
    });

    userPool.addDomain('UserPoolDomain', {
      cognitoDomain: { domainPrefix: 'dairy-851725642854' },
    });

    NagSuppressions.addStackSuppressions(this, [
      {
        id: 'AwsSolutions-COG2',
        reason: '一般ユーザにMFAはいらないと判断した.',
      },
      {
        id: 'AwsSolutions-COG3',
        reason: 'このプロジェクトではAdvancedSecurityModeをENFORCEDに設定する必要はないと判断した。',
      },
      {
        id: 'AwsSolutions-IAM5',
        reason: '暫定的にオフにしているが、本番環境では適切なIAMポリシーを設定すること。',
      },
      
    ])
  }
}
