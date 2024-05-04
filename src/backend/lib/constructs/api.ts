import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const table =new dynamodb.Table(this, `diary-contents-table`, {
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

    const diaryCreateFunction = new lambda.Function(this, 'diar-create-lambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_create.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
    });
    table.grantWriteData(diaryCreateFunction);
    // const backendLambda = new lambda.Function(this, 'BackendLambda', {
    //   runtime: lambda.Runtime.NODEJS_14_X,
    //   code: lambda.Code.fromAsset('path/to/lambda/code'),
    //   handler: 'index.handler',
    // });

    // const api = new apigateway.RestApi(this, 'ApiGateway', {
    //   restApiName: 'ServiceAPI',
    // });

    // const lambdaIntegration = new apigateway.LambdaIntegration(backendLambda);
    // api.root.addMethod('GET', lambdaIntegration);
    NagSuppressions.addStackSuppressions(this, [
      {
        id: 'AwsSolutions-L1',
        reason: 'CDKにより自動で作成されるLambdaに適用されてしまうため',
       },
       {
        id: 'AwsSolutions-IAM4',
        reason: 'CDKにより自動で作成されるLambdaに適用されてしまうため',
       },
    ])
  }
}
