import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiStack } from './constructs/api';
import { AuthStack } from './constructs/auth';
import { WebHostingStack } from './constructs/web';

interface BackendStackProps extends cdk.StackProps { }

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const logBucket = new s3.Bucket(this, 'LogBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      serverAccessLogsPrefix: 'log/',
    });

    // ウェブホスティングスタックのインスタンス化
    const hostingStack = new WebHostingStack(this, 'WebHostingStack',{
      logBucket,
    });

    // 認証機能スタックのインスタンス化
    const authStack = new AuthStack(this, 'AuthStack');

    // API機能スタックのインスタンス化
    const apiStack= new ApiStack(this, 'ApiStack');
  }
}