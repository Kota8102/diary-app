import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface BackendStackProps extends cdk.StackProps { }

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const logBucket = new s3.Bucket(this, `LogBucket`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      serverAccessLogsPrefix: "log/",
    });

    new s3.Bucket(this, `DiaryBucket`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      serverAccessLogsBucket: logBucket,
      serverAccessLogsPrefix: "DiaryLog/",
    });

    new dynamodb.Table(this, `DiaryContentsTable`, {
      partitionKey: {
        name: "user_id",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "date",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    const userPool = new cognito.UserPool(this, `DiaryUserPool`, {
      userPoolName: `diary-user-pool`,
      signInAliases: {
        email: true,
      },
      selfSignUpEnabled: true,
      autoVerify: {
        email: true,
      },
      userVerification: {
        emailSubject: 'メールアドレスを認証してください。',
        emailBody: 'ご登録ありがとうございます。 あなたの認証コードは {####} です。',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      standardAttributes: {
        familyName: {
          mutable: false,
          required: true,
        },
        givenName: {
          mutable: false,
          required: true,
        },
        address: {
          mutable: true,
          required: false,
        },
        gender: {
          mutable: true,
          required: true,
        },
        email: {
          mutable: false,
          required: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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

    // Cognito Identity Pool
    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
     });

    userPool.addDomain('UserPoolDomain', {
      cognitoDomain: { domainPrefix: 'dairy-851725642854a' },
    });
  }
}