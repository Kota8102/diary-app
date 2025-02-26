import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import type * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import type * as s3 from 'aws-cdk-lib/aws-s3'
import type * as sqs from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'

export interface DiaryProps {
  userPool: cognito.UserPool
  api: apigateway.RestApi
  cognitoAuthorizer: apigateway.CognitoUserPoolsAuthorizer
  table: dynamodb.Table
  generativeAiTable: dynamodb.Table
  flowerSelectFunction: lambda.Function
  originalImageBucket: s3.Bucket
  flowerBucket: s3.Bucket
  imageProcessingQueue: sqs.Queue
}

export class Diary extends Construct {
  public readonly diaryTableEventSource: DynamoEventSource
  public readonly bouquetTable: dynamodb.Table

  constructor(scope: Construct, id: string, props: DiaryProps) {
    super(scope, id)

    // DynamoDBストリームイベントソースの設定
    const diaryTableEventSource = new DynamoEventSource(props.table, {
      startingPosition: lambda.StartingPosition.LATEST,
    })

    // 日記作成用Lambda関数の定義
    const diaryCreateFunction = new lambda.Function(this, 'diaryCreateLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_create.lambda_handler',
      code: lambda.Code.fromAsset('lambda/diary_create', {
        bundling: {
          image: lambda.Runtime.PYTHON_3_11.bundlingImage,
          command: ['bash', '-c', 'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'],
        },
      }),
      logRetention: 14,
      environment: {
        TABLE_NAME: props.table.tableName,
        ORIGINAL_IMAGE_BUCKET_NAME: props.originalImageBucket.bucketName,
        FLOWER_SELECT_FUNCTION_NAME: props.flowerSelectFunction.functionName,
        FLOWER_BUKCET_NAME: props.flowerBucket.bucketName,
        IMAGE_PROCESSING_QUEUE_URL: props.imageProcessingQueue.queueUrl,
      },
      timeout: cdk.Duration.seconds(30),
    })
    props.table.grantWriteData(diaryCreateFunction)
    props.flowerSelectFunction.grantInvoke(diaryCreateFunction)
    props.originalImageBucket.grantRead(diaryCreateFunction)
    props.flowerBucket.grantPut(diaryCreateFunction)
    props.imageProcessingQueue.grantSendMessages(diaryCreateFunction)

    // 日記編集用Lambda関数の定義
    const diaryEditFunction = new lambda.Function(this, 'diaryEditLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_edit.lambda_handler',
      code: lambda.Code.fromAsset('lambda/diary_edit'),
      logRetention: 14,
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    })
    props.table.grantReadWriteData(diaryEditFunction)

    // 日記閲覧用Lambda関数の定義
    const diaryReadFunction = new lambda.Function(this, 'diaryReadLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_read.lambda_handler',
      code: lambda.Code.fromAsset('lambda/diary_read'),
      logRetention: 14,
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    })
    props.table.grantReadData(diaryReadFunction)

    // 日記削除用Lambda関数の定義
    const diaryDeleteFunction = new lambda.Function(this, 'diaryDeleteLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_delete.lambda_handler',
      code: lambda.Code.fromAsset('lambda/diary_delete'),
      logRetention: 14,
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    })
    props.table.grant(diaryDeleteFunction, 'dynamodb:DeleteItem')
    // API Gatewayのエンドポイント設定
    const diaryApi = props.api.root.addResource('diary')

    // 各エンドポイントのメソッド定義
    diaryApi.addMethod('POST', new apigateway.LambdaIntegration(diaryCreateFunction), {
      authorizer: props.cognitoAuthorizer,
    })
    diaryApi.addMethod('PUT', new apigateway.LambdaIntegration(diaryEditFunction), {
      authorizer: props.cognitoAuthorizer,
    })
    diaryApi.addMethod('GET', new apigateway.LambdaIntegration(diaryReadFunction), {
      authorizer: props.cognitoAuthorizer,
    })
    diaryApi.addMethod('DELETE', new apigateway.LambdaIntegration(diaryDeleteFunction), {
      authorizer: props.cognitoAuthorizer,
    })

    // 生成AI用Lambda関数のロール作成
    const generativeAiLambdaRole = new cdk.aws_iam.Role(this, 'generativeAiLambdaRole', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
    })
    const ssmPolicy = new cdk.aws_iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: ['*'],
    })
    const cloudwatchPolicy = new cdk.aws_iam.PolicyStatement({
      actions: ['logs:DeleteRetentionPolicy', 'logs:PutRetentionPolicy', 'logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      resources: ['*'],
    })
    generativeAiLambdaRole.addToPolicy(ssmPolicy)
    generativeAiLambdaRole.addToPolicy(cloudwatchPolicy)

    // タイトル生成用Lambda関数の定義
    const diaryGenerateTitleCreateFunction = new lambda.Function(this, 'TitleGenerateLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'title_generate.lambda_handler',
      code: lambda.Code.fromAsset('lambda/title_generate'),
      role: generativeAiLambdaRole,
      environment: {
        TABLE_NAME: props.generativeAiTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    })
    props.generativeAiTable.grantWriteData(diaryGenerateTitleCreateFunction)
    props.table.grantStreamRead(diaryGenerateTitleCreateFunction)
    diaryGenerateTitleCreateFunction.addEventSource(diaryTableEventSource)

    // タイトル取得用Lambda関数の定義
    const titleGetFunction = new lambda.Function(this, 'titleGetFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'title_get.lambda_handler',
      code: lambda.Code.fromAsset('lambda/title_get'),
      environment: {
        TABLE_NAME: props.generativeAiTable.tableName,
      },
    })
    props.generativeAiTable.grantReadData(titleGetFunction)

    const titleApi = props.api.root.addResource('title')

    titleApi.addMethod('GET', new apigateway.LambdaIntegration(titleGetFunction), {
      authorizer: props.cognitoAuthorizer,
    })

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

    const getDiaryDataFunction = new lambda.Function(this, 'getDiaryDataFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'get_diary_data.lambda_handler',
      code: lambda.Code.fromAsset('lambda/get_diary_data'),
      environment: {
        GENERATIVE_AI_TABLE_NAME: props.generativeAiTable.tableName,
        DIARY_TABLE_NAME: props.table.tableName,
        FLOWER_BUCKET_NAME: props.flowerBucket.bucketName,
        BOUQUET_TABLE_NAME: bouquetTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    })
    props.generativeAiTable.grantReadData(getDiaryDataFunction)
    props.flowerBucket.grantRead(getDiaryDataFunction)
    props.table.grantReadData(getDiaryDataFunction)

    const diaryDataApi = props.api.root.addResource('data')

    diaryDataApi.addMethod('GET', new apigateway.LambdaIntegration(getDiaryDataFunction), {
      authorizer: props.cognitoAuthorizer,
    })

    this.bouquetTable = bouquetTable
  }
}
