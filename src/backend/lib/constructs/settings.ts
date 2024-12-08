import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import type * as cognito from 'aws-cdk-lib/aws-cognito'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

export interface SettingsProps {
  userPool: cognito.UserPool
  api: apigateway.RestApi
  cognitoAuthorizer: apigateway.CognitoUserPoolsAuthorizer
}

export class Settings extends Construct {
  constructor(scope: Construct, id: string, props: SettingsProps) {
    super(scope, id)

    // 花束画像保存用のS3バケットの作成
    const userSettingsBucket = new s3.Bucket(this, 'userSettingsBucket', {
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    })

    //プロフィール画像アップロード用Lambda関数の定義
    const uploadProfileImageFunction = new lambda.Function(this, 'uploadProfileImageFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'upload_profile_image.lambda_handler',
      timeout: cdk.Duration.seconds(15),
      code: lambda.Code.fromAsset('lambda/upload_profile_image', {
        bundling: {
          image: lambda.Runtime.PYTHON_3_11.bundlingImage,
        },
      }),
      environment: {
        USER_SETTINGS_BUCKET: userSettingsBucket.bucketName,
      },
    })

    // /APIの設定
    const settingsApi = props.api.root.addResource('settings')

    settingsApi.addMethod('POST', new apigateway.LambdaIntegration(uploadProfileImageFunction), {
      authorizer: props.cognitoAuthorizer,
    })
  }
}
