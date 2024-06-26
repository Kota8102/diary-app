import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { Construct } from 'constructs'

export class Api extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id)
    const table = new dynamodb.Table(this, `diaryContentsTable`, {
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

    const LambdaRole = new cdk.aws_iam.Role(this, 'Lambda Excecution Role', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
    })

    LambdaRole.addManagedPolicy(
      cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    )

    const diaryCreateFunction = new lambda.Function(this, 'diaryCreateLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_create.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      role: LambdaRole,
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
      },
    })
    table.grantWriteData(diaryCreateFunction)
    const diaryEditFunction = new lambda.Function(this, 'diaryEditLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_edit.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      role: LambdaRole,
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
      },
    })
    table.grantReadWriteData(diaryEditFunction)
    const diaryReadFunction = new lambda.Function(this, 'diaryReadLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_read.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      role: LambdaRole,
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
      },
    })
    table.grantReadData(diaryReadFunction)

    const diaryDeleteFunction = new lambda.Function(this, 'diaryDeleteLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_delete.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      role: LambdaRole,
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
      },
    })
    table.grant(diaryDeleteFunction, 'dynamodb:DeleteItem')

    // CloudWatch Logsへのアクセスを許可するロールの作成
    const cloudwatchLogsRole = new cdk.aws_iam.Role(this, 'APIGatewayCloudWatchLogsRole', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonAPIGatewayPushToCloudWatchLogs'
        ),
      ],
    })

    // API Gateway の作成
    const logGroup = new cdk.aws_logs.LogGroup(this, 'ApiGatewayAccessLogs', {
      retention: 14,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const api = new apigateway.RestApi(this, 'DiaryApi', {
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: cdk.RemovalPolicy.DESTROY,
      deployOptions: {
        // アクセスロギングの設定
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
        // CloudWatch Logsへのログ出力を有効にします。
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    })

    // Request Validatorの作成
    const requestValidator = api.addRequestValidator('RequestValidator', {
      validateRequestBody: true,
      validateRequestParameters: true,
    })

    // エンドポイントの設定
    const diary = api.root.addResource('diary')

    // POSTエンドポイント - 日記の作成
    diary.addMethod('POST', new apigateway.LambdaIntegration(diaryCreateFunction))

    // PUTエンドポイント - 日記の編集
    diary.addMethod('PUT', new apigateway.LambdaIntegration(diaryEditFunction))
    // GETエンドポイント - 日記の閲覧
    diary.addMethod('GET', new apigateway.LambdaIntegration(diaryReadFunction))
    // DELETEエンドポイント - 日記の削除
    diary.addMethod('DELETE', new apigateway.LambdaIntegration(diaryDeleteFunction))

    const generativeAiTable = new dynamodb.Table(this, `generativeAiTable`, {
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

    const generativeAiLambdaRole = new cdk.aws_iam.Role(this, 'generativeAiLambdaRole', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
    })
    const ssmPolicy = new cdk.aws_iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: ['*'],
    })
    generativeAiLambdaRole.addToPolicy(ssmPolicy)

    const diaryGenerateTitleCreateFunction = new lambda.Function(
      this,
      'diaryGenerateTitleCreateLambda',
      {
        runtime: lambda.Runtime.PYTHON_3_11,
        handler: 'diary_generate_title_create.lambda_handler',
        code: lambda.Code.fromAsset('lambda'),
        role: generativeAiLambdaRole,
        environment: {
          TABLE_NAME: generativeAiTable.tableName,
        },
      }
    )
    generativeAiTable.grantWriteData(diaryGenerateTitleCreateFunction)
    table.grantStreamRead(diaryGenerateTitleCreateFunction)
    diaryGenerateTitleCreateFunction.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    )

    const titleGetFunction = new lambda.Function(this, 'titleGetFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'title_get.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: generativeAiTable.tableName,
      },
    })

    generativeAiTable.grantReadData(titleGetFunction)

    const title = api.root.addResource('title')
    title.addMethod('GET', new apigateway.LambdaIntegration(titleGetFunction))
  }
}
