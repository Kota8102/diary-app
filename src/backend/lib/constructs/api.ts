import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
    new dynamodb.Table(this, `DiaryContentsTable`, {
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
  }
}
