import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import type * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

export interface ApiProps {
  userPool: cognito.UserPool
  table: dynamodb.Table
  diaryApi: apigateway.RestApi
  generativeAiTable: dynamodb.Table
}

export class Api extends Construct {
  public readonly diaryApi: apigateway.RestApi
  public readonly generativeAiTable: dynamodb.Table
  public readonly table: dynamodb.Table

  constructor(scope: Construct, id: string, props: ApiProps) {
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

    const flowerApi = props.diaryApi.root.addResource('flower')
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'apiCognitoAuthorizer', {
      cognitoUserPools: [props.userPool],
    })

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
      authorizer: cognitoAuthorizer,
    })

    // 花束画像保存用のS3バケットの作成
    const bouquetBucket = new s3.Bucket(this, 'bouquetBucket', {
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    })

    // 花束取得用Lambda関数の定義
    const bouquetGetFunction = new lambda.Function(this, 'bouquetGetFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'bouquet_get.lambda_handler',
      code: lambda.Code.fromAsset('lambda/bouquet_get'),
      environment: {
        BUCKET_NAME: bouquetBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(10),
    })
    bouquetBucket.grantRead(bouquetGetFunction)

    // /bouquet APIの設定
    const bouquetApi = props.diaryApi.root.addResource('bouquet')

    bouquetApi.addMethod('GET', new apigateway.LambdaIntegration(bouquetGetFunction), {
      authorizer: cognitoAuthorizer,
      requestParameters: {
        'method.request.querystring.date': true,
      },
      requestValidatorOptions: {
        requestValidatorName: 'ValidateQueryString',
        validateRequestParameters: true,
      },
    })

    // 日記コンテンツを保存するDynamoDBテーブルの作成
    const bouquetTable = new dynamodb.Table(this, 'BouquetTable', {
      partitionKey: {
        name: 'user_id',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'year_week',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    })

    //花束作成用Lambda関数の定義
    const BouquetCreate = new lambda.Function(this, 'BouquetCreate', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'bouquet_create.lambda_handler',
      timeout: cdk.Duration.seconds(15),
      code: lambda.Code.fromAsset('lambda/bouquet_create', {
        bundling: {
          image: lambda.Runtime.PYTHON_3_11.bundlingImage,
          command: ['bash', '-c', 'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'],
        },
      }),
      environment: {
        GENERATIVE_AI_TABLE_NAME: props.generativeAiTable.tableName,
        BOUQUET_TABLE_NAME: bouquetTable.tableName,
        FLOWER_BUCKET_NAME: flowerImageBucket.bucketName,
        BOUQUET_BUCKET_NAME: bouquetBucket.bucketName,
      },
    })
    props.generativeAiTable.grantReadData(BouquetCreate)
    bouquetTable.grantWriteData(BouquetCreate)
    flowerImageBucket.grantRead(BouquetCreate)
    bouquetBucket.grantPut(BouquetCreate)

    bouquetApi.addMethod('POST', new apigateway.LambdaIntegration(BouquetCreate), {
      authorizer: cognitoAuthorizer,
    })
  }
}
