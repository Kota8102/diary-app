import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class ApiStack extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);
    const table = new dynamodb.Table(this, `diary-contents-table`, {
      tableName: "diary-basic-table",
      partitionKey: {
        name: "user_id",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "date",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    const LambdaRole = new cdk.aws_iam.Role(this, "Lambda Excecution Role", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "lambda-basic-excecution-role",
    });

    const diaryCreateFunction = new lambda.Function(
      this,
      "diary-create-lambda",
      {
        functionName: "create-dairy-item-lambda",
        runtime: lambda.Runtime.PYTHON_3_11,
        handler: "diary_create.lambda_handler",
        code: lambda.Code.fromAsset("lambda"),
        role: LambdaRole,
        logRetention: 14,
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );
    table.grantWriteData(diaryCreateFunction);

    const diaryEditFunction = new lambda.Function(this, "diary-edit-lambda", {
      functionName: "edit-dairy-item-lambda",
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: "diary_edit.lambda_handler",
      code: lambda.Code.fromAsset("lambda"),
      role: LambdaRole,
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(diaryEditFunction);
    const diaryReadFunction = new lambda.Function(this, "diary-read-lambda", {
      functionName: "read-dairy-item-lambda",
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: "diary_read.lambda_handler",
      code: lambda.Code.fromAsset("lambda"),
      role: LambdaRole,
      logRetention: 14,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(diaryReadFunction);

    const diaryDeleteFunction = new lambda.Function(
      this,
      "diary-delete-lambda",
      {
        functionName: "delete-dairy-item-lambda",
        runtime: lambda.Runtime.PYTHON_3_11,
        handler: "diary_delete.lambda_handler",
        code: lambda.Code.fromAsset("lambda"),
        role: LambdaRole,
        logRetention: 14,
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );
    table.grant(diaryDeleteFunction, "dynamodb:DeleteItem");

    // CloudWatch Logsへのアクセスを許可するロールの作成
    const cloudwatchLogsRole = new cdk.aws_iam.Role(
      this,
      "APIGatewayCloudWatchLogsRole",
      {
        roleName: "apigateway-cloudwatchlogs-role",
        assumedBy: new cdk.aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AmazonAPIGatewayPushToCloudWatchLogs"
          ),
        ],
      }
    );

    // API Gateway の作成
    const logGroup = new cdk.aws_logs.LogGroup(this, "ApiGatewayAccessLogs", {
      logGroupName: "apigateway-accesslogs",
      retention: 14,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const api = new apigateway.RestApi(this, "DiaryApi", {
      restApiName: "diary-basic-api",
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
    });

    // Request Validatorの作成
    const requestValidator = api.addRequestValidator("RequestValidator", {
      validateRequestBody: true,
      validateRequestParameters: true,
    });

    // エンドポイントの設定
    const diary = api.root.addResource("diary");

    // POSTエンドポイント - 日記の作成
    diary.addMethod(
      "POST",
      new apigateway.LambdaIntegration(diaryCreateFunction)
    );

    // PUTエンドポイント - 日記の編集
    diary.addMethod("PUT", new apigateway.LambdaIntegration(diaryEditFunction));
    // GETエンドポイント - 日記の閲覧
    diary.addMethod("GET", new apigateway.LambdaIntegration(diaryReadFunction));
    // DELETEエンドポイント - 日記の削除
    diary.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(diaryDeleteFunction)
    );

    const generativeAiTable = new dynamodb.Table(this, `generative-ai-table`, {
      tableName: "generative-ai-table",
      partitionKey: {
        name: "user_id",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "date",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    const generativeAiLambdaRole = new cdk.aws_iam.Role(
      this,
      "generativeAiLambdaRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        roleName: "generative-ai-lambda-role",
      }
    );
    const ssmPolicy = new cdk.aws_iam.PolicyStatement({
      actions: ["ssm:GetParameter"],
      resources: ["*"],
    });
    const dynamodbStreamPolicy = new cdk.aws_iam.PolicyStatement({
      actions: [
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:DescribeStream",
        "dynamodb:ListStreams",
      ],
      resources: [table.tableArn],
    });
    generativeAiLambdaRole.addToPolicy(ssmPolicy);
    generativeAiLambdaRole.addToPolicy(dynamodbStreamPolicy);

    new ssm.StringParameter(this, "openai-api-key", {
      parameterName: "OpenAI_API_KEY",
      stringValue: "dummy",
    });

    const diaryGenerateTitleCreateFunction = new lambda.Function(
      this,
      "diary-generate-title-create-lambda",
      {
        functionName: "diary-generate-title-create-lambda",
        runtime: lambda.Runtime.PYTHON_3_11,
        handler: "diary_generate_title_create.lambda_handler",
        code: lambda.Code.fromAsset("lambda"),
        role: generativeAiLambdaRole,

        environment: {
          TABLE_NAME: generativeAiTable.tableName,
        },
      }
    );
    generativeAiTable.grantWriteData(diaryGenerateTitleCreateFunction);
  }
}
