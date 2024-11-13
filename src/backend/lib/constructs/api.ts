import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import type * as cognito from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'

export interface ApiProps {
  userPool: cognito.UserPool
}

export class Api extends Construct {
  public readonly api: apigateway.RestApi
  public readonly cognitoAuthorizer: apigateway.CognitoUserPoolsAuthorizer

  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id)

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

    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [props.userPool],
    })

    // リクエストバリデーターの追加
    api.addRequestValidator('RequestValidator', {
      validateRequestBody: true,
      validateRequestParameters: true,
    })

    this.api = api
    this. cognitoAuthorizer = cognitoAuthorizer
  }
}
