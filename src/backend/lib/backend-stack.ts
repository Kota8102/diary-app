import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cognito from "aws-cdk-lib/aws-cognito";

interface BackendStackProps extends cdk.StackProps {
  environment: string;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    new s3.Bucket(this, `diary-${props.environment}-bucket`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userpool = new cognito.UserPool(this,  `diary-${props.environment}-user-pool`, {
      userPoolName:  `diary-${props.environment}-user-pool`,
      signInAliases: {
        email: true,
      },
      selfSignUpEnabled: true,
      autoVerify: {
        email: true,
      },
      userVerification: {
        emailSubject: 'メールアドレスを認証してください。',
        emailBody: 'ご登録ありがとうございます。 あなたの認証コードは {####} です。', // # This placeholder is a must if code is selected as preferred verification method
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
      // customAttributes: {
      //   'tenantId': new cognito.StringAttribute({
      //     mutable: false,
      //     minLen: 10,
      //     maxLen: 15,
      //   }),
      //   'createdAt': new cognito.DateTimeAttribute(),
      //   'employeeId': new cognito.NumberAttribute({
      //     mutable: false,
      //     min: 1,
      //     max: 100,
      //   }),
      //   'isAdmin': new cognito.BooleanAttribute({
      //     mutable: false,
      //   }),
      // },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: false,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
