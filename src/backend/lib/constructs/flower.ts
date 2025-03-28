import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import type * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'

export interface FlowerProps {
  userPool: cognito.UserPool
  api: apigateway.RestApi
  cognitoAuthorizer: apigateway.CognitoUserPoolsAuthorizer
}

export class Flower extends Construct {
  public readonly originalImageBucket: s3.Bucket
  public readonly table: dynamodb.Table
  public readonly generativeAiTable: dynamodb.Table
  public readonly flowerSelectFunction: lambda.Function
  public readonly flowerBucket: s3.Bucket
  public readonly imageProcessingQueue: sqs.Queue
  constructor(scope: Construct, id: string, props: FlowerProps) {
    super(scope, id)

    // 日記コンテンツを保存するDynamoDBテーブルの作成
    const table = new dynamodb.Table(this, 'diaryContentsTable', {
      partitionKey: {
        name: 'user_id',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'date',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    })

    // 生成AI用のDynamoDBテーブルの作成
    const generativeAiTable = new dynamodb.Table(this, 'generativeAiTable', {
      partitionKey: {
        name: 'user_id',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'date',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    })

    // 元画像保存用S3バケットの作成
    const originalImageBucket = new s3.Bucket(this, 'originalImageBucket', {
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    })

    // ユーザーごとの花画像保存用S3バケットの作成
    const flowerBucket = new s3.Bucket(this, 'flowerBucket', {
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    })

    // デッドレターキューの作成
    const deadLetterQueue = new sqs.Queue(this, 'imageProcessingDLQ', {
      retentionPeriod: cdk.Duration.days(14), // メッセージ保持期間
      enforceSSL: true, // SSL を強制
    })

    // メインの SQS キューの作成
    const imageProcessingQueue = new sqs.Queue(this, 'imageProcessingQueue', {
      visibilityTimeout: cdk.Duration.seconds(300), // メッセージ処理の最大時間
      retentionPeriod: cdk.Duration.days(4), // メッセージの保持期間
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 5, // 最大試行回数
      },
      enforceSSL: true, // SSL を強制
    })

    // 花の画像選択用Lambda関数の定義
    const flowerSelectFunction = new lambda.Function(this, 'flowerSelectFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'flower_select.lambda_handler',
      code: lambda.Code.fromAsset('lambda/flower_select', {
        bundling: {
          image: lambda.Runtime.PYTHON_3_11.bundlingImage,
          command: ['bash', '-c', 'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'],
        },
      }),
      environment: {
        DIARY_TABLE_NAME: table.tableName,
        GENERATIVE_AI_TABLE_NAME: generativeAiTable.tableName,
        ORIGINAL_IMAGE_BUCKET_NAME: originalImageBucket.bucketName,
        FLOWER_BUCKET_NAME: flowerBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(60),
    })
    generativeAiTable.grantWriteData(flowerSelectFunction)
    flowerBucket.grantPut(flowerSelectFunction)
    table.grantStreamRead(flowerSelectFunction)
    originalImageBucket.grantPut(flowerSelectFunction)
    const difyApiKey = ssm.StringParameter.fromStringParameterAttributes(this, 'DifyApiKey', {
      parameterName: 'DIFY_API_KEY',
    })
    flowerSelectFunction.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [difyApiKey.parameterArn],
        actions: ['ssm:GetParameter'],
      }),
    )

    // 花の画像取得用Lambda関数の定義
    const flowerGetFunction = new lambda.Function(this, 'flowerGetFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'flower_get.lambda_handler',
      code: lambda.Code.fromAsset('lambda/flower_get'),
      environment: {
        ORIGINAL_BUCKET_NAME: originalImageBucket.bucketName,
        GENERATIVE_AI_TABLE_NAME: generativeAiTable.tableName,
        FLOWER_BUCKET_NAME: flowerBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(10),
    })
    originalImageBucket.grantRead(flowerGetFunction)
    generativeAiTable.grantReadData(flowerGetFunction)

    // flower_vase Lambda 関数の作成
    const flowerVaseFunction = new lambda.Function(this, 'flowerVaseFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'flower_vase.lambda_handler',
      code: lambda.Code.fromAsset('lambda/flower_vase', {
        bundling: {
          image: lambda.Runtime.PYTHON_3_11.bundlingImage,
          command: ['bash', '-c', 'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'],
        },
      }),
      environment: {
        ORIGINAL_IMAGE_BUCKET_NAME: originalImageBucket.bucketName,
        FLOWER_BUCKET_NAME: flowerBucket.bucketName,
        QUEUE_URL: imageProcessingQueue.queueUrl,
      },
      timeout: cdk.Duration.seconds(60),
    })

    // flower_vase Lambda に必要な権限を付与
    originalImageBucket.grantRead(flowerVaseFunction)
    flowerBucket.grantPut(flowerVaseFunction)
    imageProcessingQueue.grantConsumeMessages(flowerVaseFunction)

    // SQS トリガを Lambda に設定
    flowerVaseFunction.addEventSource(new SqsEventSource(imageProcessingQueue, { batchSize: 1 }))

    // flower API の設定
    const flowerApi = props.api.root.addResource('flower')

    flowerApi.addMethod('GET', new apigateway.LambdaIntegration(flowerGetFunction), {
      authorizer: props.cognitoAuthorizer,
    })

    this.originalImageBucket = originalImageBucket
    this.table = table
    this.generativeAiTable = generativeAiTable
    this.flowerSelectFunction = flowerSelectFunction
    this.flowerBucket = flowerBucket
    this.imageProcessingQueue = imageProcessingQueue
  }
}
