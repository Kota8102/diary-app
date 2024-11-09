import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import type * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

export interface ApiProps {
  userPool: cognito.UserPool
}

export class Api extends Construct {
  public readonly api: apigateway.RestApi

  constructor(scope: Construct, id: string, props: ApiProps) {
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

    // DynamoDBストリームイベントソースの設定
    const diaryTableEventSource = new DynamoEventSource(table, {
      startingPosition: lambda.StartingPosition.LATEST,
    })

    // 日記作成用Lambda関数の定義
    const diaryCreateFunction = new lambda.Function(this, 'diaryCreateLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_create.lambda_handler',
      code: lambda.Code.fromAsset('lambda/diary_create'),
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
      },
    })
    table.grantWriteData(diaryCreateFunction)

    // 日記編集用Lambda関数の定義
    const diaryEditFunction = new lambda.Function(this, 'diaryEditLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_edit.lambda_handler',
      code: lambda.Code.fromAsset('lambda/diary_edit'),
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
      },
    })
    table.grantReadWriteData(diaryEditFunction)

    // 日記閲覧用Lambda関数の定義
    const diaryReadFunction = new lambda.Function(this, 'diaryReadLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_read.lambda_handler',
      code: lambda.Code.fromAsset('lambda/diary_read'),
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
      },
    })
    table.grantReadData(diaryReadFunction)

    // 日記削除用Lambda関数の定義
    const diaryDeleteFunction = new lambda.Function(this, 'diaryDeleteLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_delete.lambda_handler',
      code: lambda.Code.fromAsset('lambda/diary_delete'),
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
      },
    })
    table.grant(diaryDeleteFunction, 'dynamodb:DeleteItem')

    // API Gateway用のCloudWatch Logsアクセス権限を持つロールの作成
    const cloudwatchLogsRole = new cdk.aws_iam.Role(this, 'APIGatewayCloudWatchLogsRole', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')],
    })

    // API Gatewayのアクセスログ用LogGroupの作成
    const logGroup = new cdk.aws_logs.LogGroup(this, 'ApiGatewayAccessLogs', {
      retention: 14,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // API Gatewayの作成
    const api = new apigateway.RestApi(this, 'DiaryApi', {
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: cdk.RemovalPolicy.DESTROY,
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    })

    // リクエストバリデーターの追加
    const requestValidator = api.addRequestValidator('RequestValidator', {
      validateRequestBody: true,
      validateRequestParameters: true,
    })

    // API Gatewayのエンドポイント設定
    const diary = api.root.addResource('diary')
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'cognitoAuthorizer', {
      cognitoUserPools: [props.userPool],
    })

    diary.addMethod(
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

    // 各エンドポイントのメソッド定義
    diary.addMethod('POST', new apigateway.LambdaIntegration(diaryCreateFunction), {
      authorizer: cognitoAuthorizer,
    })
    diary.addMethod('PUT', new apigateway.LambdaIntegration(diaryEditFunction), {
      authorizer: cognitoAuthorizer,
    })
    diary.addMethod('GET', new apigateway.LambdaIntegration(diaryReadFunction), {
      authorizer: cognitoAuthorizer,
    })
    diary.addMethod('DELETE', new apigateway.LambdaIntegration(diaryDeleteFunction), {
      authorizer: cognitoAuthorizer,
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
        TABLE_NAME: generativeAiTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    })
    generativeAiTable.grantWriteData(diaryGenerateTitleCreateFunction)
    table.grantStreamRead(diaryGenerateTitleCreateFunction)
    diaryGenerateTitleCreateFunction.addEventSource(diaryTableEventSource)

    // タイトル取得用Lambda関数の定義
    const titleGetFunction = new lambda.Function(this, 'titleGetFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'title_get.lambda_handler',
      code: lambda.Code.fromAsset('lambda/title_get'),
      environment: {
        TABLE_NAME: generativeAiTable.tableName,
      },
    })
    generativeAiTable.grantReadData(titleGetFunction)
    const titleApi = api.root.addResource('title')
    titleApi.addMethod(
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
    titleApi.addMethod('GET', new apigateway.LambdaIntegration(titleGetFunction), {
      authorizer: cognitoAuthorizer,
    })

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
        DIARY_TABLE_NAME: table.tableName,
        GENERATIVE_AI_TABLE_NAME: generativeAiTable.tableName,
        FLOWER_BUCKET_NAME: flowerImageBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(60),
    })
    generativeAiTable.grantWriteData(flowerGenerateFunction)
    table.grantStreamRead(flowerGenerateFunction)
    flowerImageBucket.grantPut(flowerGenerateFunction)
    flowerGenerateFunction.addEventSource(diaryTableEventSource)
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

    const flowerApi = api.root.addResource('flower')
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
    const bouquetApi = api.root.addResource('bouquet')

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
        GENERATIVE_AI_TABLE_NAME: generativeAiTable.tableName,
        BOUQUET_TABLE_NAME: bouquetTable.tableName,
        FLOWER_BUCKET_NAME: flowerImageBucket.bucketName,
        BOUQUET_BUCKET_NAME: bouquetBucket.bucketName,
      },
    })
    generativeAiTable.grantReadData(BouquetCreate)
    bouquetTable.grantWriteData(BouquetCreate)
    flowerImageBucket.grantRead(BouquetCreate)
    bouquetBucket.grantPut(BouquetCreate)

    bouquetApi.addMethod('POST', new apigateway.LambdaIntegration(BouquetCreate), {
      authorizer: cognitoAuthorizer,
    })

    this.api = api
  }
}
