import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import type * as cognito from 'aws-cdk-lib/aws-cognito'
import type * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

export interface FlowerProps {
  userPool: cognito.UserPool
  table: dynamodb.Table
  api: apigateway.RestApi
  generativeAiTable: dynamodb.Table
  cognitoAuthorizer: apigateway.CognitoUserPoolsAuthorizer
}

export class Flower extends Construct {
  public readonly flowerImageBucket: s3.Bucket
  constructor(scope: Construct, id: string, props: FlowerProps) {
    super(scope, id)

    // 花の画像保存用S3バケットの作成
    const flowerImageBucket = new s3.Bucket(this, 'flowerImageBucket', {
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    })

    // 花の画像生成用Lambda関数の定義
    const flowerGenerateFunction = new lambda.Function(this, 'flowerGenerateFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'flower_generate.lambda_handler',
      code: lambda.Code.fromAsset('lambda/flower_generate', {
        bundling: {
          image: lambda.Runtime.PYTHON_3_11.bundlingImage,
          command: ['bash', '-c', 'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'],
        },
      }),
      environment: {
        DIARY_TABLE_NAME: props.table.tableName,
        GENERATIVE_AI_TABLE_NAME: props.generativeAiTable.tableName,
        FLOWER_BUCKET_NAME: flowerImageBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(60),
    })
    props.generativeAiTable.grantWriteData(flowerGenerateFunction)
    props.table.grantStreamRead(flowerGenerateFunction)
    flowerImageBucket.grantPut(flowerGenerateFunction)
    flowerGenerateFunction.addToRolePolicy(
      new iam.PolicyStatement({
        resources: ['arn:aws:ssm:ap-northeast-1:851725642854:parameter/OpenAI_API_KEY'],
        actions: ['ssm:GetParameter'],
      }),
    )

    // 花の画像取得用Lambda関数の定義
    const flowerGetFunction = new lambda.Function(this, 'flowerGetFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'flower_get.lambda_handler',
      code: lambda.Code.fromAsset('lambda/flower_get'),
      environment: {
        BUCKET_NAME: flowerImageBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(10),
    })
    flowerImageBucket.grantRead(flowerGetFunction)
    // flower API の設定
    const flowerApi = props.api.root.addResource('flower')

    flowerApi.addMethod(
      'OPTIONS',
      new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              'method.response.header.Access-Control-Allow-Origin': "'*'",
              'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,POST,PUT,DELETE'",
            },
          },
        ],
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': '{"statusCode": 200}',
        },
      }),
      {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Methods': true,
            },
          },
        ],
      },
    )
    flowerApi.addMethod('GET', new apigateway.LambdaIntegration(flowerGetFunction), {
      authorizer: props.cognitoAuthorizer,
    })

    this.flowerImageBucket = flowerImageBucket
  }
}