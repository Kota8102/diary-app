import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { ApiStack } from './constructs/api';
import { AuthStack } from './constructs/auth';
import { WebHostingStack } from './constructs/web';

interface BackendStackProps extends cdk.StackProps { }

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);
    // ウェブホスティングスタックのインスタンス化
    const hostingStack = new WebHostingStack(this, 'WebHostingStack');

    // 認証機能スタックのインスタンス化
    const authStack = new AuthStack(this, 'AuthStack');

    // 認証機能スタックのインスタンス化
    const apiStack= new ApiStack(this, 'ApiStack');
  }
}