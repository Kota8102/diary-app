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

    const LambdaRole = new cdk.aws_iam.Role(this, 'Lambda Excecution Role', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    
    LambdaRole.addManagedPolicy(cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));

    const diaryCreateFunction = new lambda.Function(this, 'diar-create-lambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'diary_create.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      role: LambdaRole
    });
    table.grantWriteData(diaryCreateFunction);

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
