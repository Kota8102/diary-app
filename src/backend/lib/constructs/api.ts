import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const backendLambda = new lambda.Function(this, 'BackendLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('path/to/lambda/code'),
      handler: 'index.handler',
    });

    const api = new apigateway.RestApi(this, 'ApiGateway', {
      restApiName: 'ServiceAPI',
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(backendLambda);
    api.root.addMethod('GET', lambdaIntegration);
  }
}
