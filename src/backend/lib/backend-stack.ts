import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface BackendStackProps extends cdk.StackProps {}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);
    const targetEnv = this.node.tryGetContext("targetEnv");

    new s3.Bucket(this, `diary-${targetEnv}-bucket`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new dynamodb.Table(this, `diary-${targetEnv}-diary-db`, {
      partitionKey: {
        name: "user_id",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "date",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
