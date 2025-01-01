import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import type * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

export interface BouquetProps {
  userPool: cognito.UserPool
  table: dynamodb.Table
  api: apigateway.RestApi
  generativeAiTable: dynamodb.Table
  cognitoAuthorizer: apigateway.CognitoUserPoolsAuthorizer
  originalImageBucket: s3.Bucket
}

export class Bouquet extends Construct {
  constructor(scope: Construct, id: string, props: BouquetProps) {
    super(scope, id)

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

    // 花束の作成情報を保存するDynamoDBテーブルの作成
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
        ORIGINAL_IMAGE_BUCKET_NAME: props.originalImageBucket.bucketName,
        BOUQUET_BUCKET_NAME: bouquetBucket.bucketName,
      },
    })
    props.generativeAiTable.grantReadData(BouquetCreate)
    bouquetTable.grantWriteData(BouquetCreate)
    props.originalImageBucket.grantRead(BouquetCreate)
    bouquetBucket.grantPut(BouquetCreate)

    // /bouquet APIの設定
    const bouquetApi = props.api.root.addResource('bouquet')

    bouquetApi.addMethod('GET', new apigateway.LambdaIntegration(bouquetGetFunction), {
      authorizer: props.cognitoAuthorizer,
      requestParameters: {
        'method.request.querystring.date': true,
      },
      requestValidatorOptions: {
        requestValidatorName: 'ValidateQueryString',
        validateRequestParameters: true,
      },
    })

    bouquetApi.addMethod('POST', new apigateway.LambdaIntegration(BouquetCreate), {
      authorizer: props.cognitoAuthorizer,
    })
  }
}
