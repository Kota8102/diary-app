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

    // プロフィール画像保存用のS3バケットの作成
    const userSettingsBucket = new s3.Bucket(this, 'userSettingsBucket', {
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST],
          allowedOrigins: ['*'],
        },
      ],
    })

    //プロフィール画像アップロード用Lambda関数の定義
    const uploadProfileImageFunction = new lambda.Function(this, 'uploadProfileImageFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'upload_profile_image.lambda_handler',
      timeout: cdk.Duration.seconds(15),
      code: lambda.Code.fromAsset('lambda/upload_profile_image'),
      environment: {
        USER_SETTINGS_BUCKET: userSettingsBucket.bucketName,
      },
    })
    userSettingsBucket.grantPut(uploadProfileImageFunction)

    //プロフィール画像取得用Lambda関数の定義
    const getProfileImageFunction = new lambda.Function(this, 'getProfileImageFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'get_profile_image.lambda_handler',
      timeout: cdk.Duration.seconds(15),
      code: lambda.Code.fromAsset('lambda/get_profile_image'),
      environment: {
        USER_SETTINGS_BUCKET: userSettingsBucket.bucketName,
      },
    })
    userSettingsBucket.grantRead(getProfileImageFunction)
    // /APIの設定
    const settingsApi = props.api.root.addResource('settings')

    // OPTIONS メソッドを明示的に追加
  settingsApi.addMethod('OPTIONS', new apigateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Methods': "'GET, POST, OPTIONS'",
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type, Authorization'",
      },
    }],
    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    requestTemplates: { 'application/json': '{"statusCode": 200}' },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Headers': true,
      },
    }],
  });


    settingsApi.addMethod('POST', new apigateway.LambdaIntegration(uploadProfileImageFunction), {
      authorizer: props.cognitoAuthorizer,
    })

    settingsApi.addMethod('GET', new apigateway.LambdaIntegration(getProfileImageFunction), {
      authorizer: props.cognitoAuthorizer,
    })
  }
}
