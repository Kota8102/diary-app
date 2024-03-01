import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

interface BackendStackProps extends cdk.StackProps {
  environment: string;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    new s3.Bucket(this, `diary-${props.environment}-bucket`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
